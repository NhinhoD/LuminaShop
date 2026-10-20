-- Harden order creation (price tampering / CWE-472).
--
-- Problem:
--   create_order_atomic trusted total_amount, price_at_purchase, status and
--   payment_status supplied by the client. Any authenticated user (or anon,
--   since EXECUTE was granted to PUBLIC) could create a fully paid order for
--   an arbitrary amount.
--
-- Fix:
--   1. Recompute the unit price and order total from products/product_variants.
--   2. Force server-controlled status/payment_status.
--   3. Enforce that the caller owns the order row.
--   4. Revoke EXECUTE from anon; keep authenticated (the app uses the anon key
--      with the user session, the function is SECURITY DEFINER).
--   5. Drop direct INSERT policies on orders/order_items that let a client
--      bypass the RPC entirely via PostgREST.

CREATE OR REPLACE FUNCTION public.create_order_atomic(order_data jsonb, items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    v_order_id uuid;
    v_item jsonb;
    v_product public.products%ROWTYPE;
    v_variant public.product_variants%ROWTYPE;
    v_inventory public.inventory_items%ROWTYPE;
    v_variant_id uuid;
    v_variant_name text;
    v_quantity integer;
    v_unit_price numeric;
    v_total numeric := 0;
    v_user_id uuid;
    v_caller uuid := auth.uid();
    v_payment_method text;
BEGIN
    v_user_id := NULLIF(order_data->>'user_id', '')::uuid;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;

    -- A user may only create their own order. service_role (auth.uid() IS NULL)
    -- is allowed for trusted server-side flows.
    IF v_caller IS NOT NULL AND v_caller <> v_user_id THEN
        RAISE EXCEPTION 'Not authorized to create an order for another user';
    END IF;

    IF items IS NULL OR jsonb_typeof(items) <> 'array' OR jsonb_array_length(items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item';
    END IF;

    v_payment_method := LOWER(COALESCE(order_data->>'payment_method', 'cod'));
    IF v_payment_method NOT IN ('cod', 'payos', 'vnpay', 'momo') THEN
        RAISE EXCEPTION 'Invalid payment method';
    END IF;

    -- Create the order shell with server-controlled status and a zero total.
    -- The total is recomputed from the database below.
    INSERT INTO public.orders (
        user_id,
        status,
        total_amount,
        shipping_address,
        contact_phone,
        contact_email,
        notes,
        payment_method,
        payment_status
    ) VALUES (
        v_user_id,
        'pending',
        0,
        CASE
            WHEN jsonb_typeof(order_data->'shipping_address') = 'object'
                THEN order_data->'shipping_address'
            ELSE '{}'::jsonb
        END,
        order_data->>'contact_phone',
        order_data->>'contact_email',
        order_data->>'notes',
        v_payment_method,
        'unpaid'
    ) RETURNING id INTO v_order_id;

    FOR v_item IN
        SELECT value
        FROM jsonb_array_elements(items)
        ORDER BY value->>'product_id', COALESCE(value->>'variant_id', '')
    LOOP
        v_quantity := COALESCE((v_item->>'quantity')::integer, 1);
        IF v_quantity < 1 OR v_quantity > 100 THEN
            RAISE EXCEPTION 'Invalid quantity';
        END IF;

        -- Load the authoritative product row; never trust the client price.
        SELECT * INTO v_product
        FROM public.products
        WHERE id = (v_item->>'product_id')::uuid
          AND deleted_at IS NULL
          AND is_active = true;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product is unavailable';
        END IF;

        v_variant_id := NULLIF(v_item->>'variant_id', '')::uuid;
        v_variant_name := NULL;
        v_unit_price := v_product.price;

        IF v_variant_id IS NOT NULL THEN
            SELECT * INTO v_variant
            FROM public.product_variants
            WHERE id = v_variant_id
              AND product_id = v_product.id
              AND deleted_at IS NULL;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product variant is unavailable';
            END IF;

            v_unit_price := v_unit_price + v_variant.price_adjustment;
            v_variant_name := v_variant.name;
        END IF;

        IF v_unit_price < 0 THEN
            RAISE EXCEPTION 'Invalid product price';
        END IF;

        -- Lock the inventory row and validate stock.
        IF v_variant_id IS NOT NULL THEN
            SELECT * INTO v_inventory
            FROM public.inventory_items
            WHERE variant_id = v_variant_id
            FOR UPDATE;
        ELSE
            SELECT * INTO v_inventory
            FROM public.inventory_items
            WHERE product_id = v_product.id AND variant_id IS NULL
            FOR UPDATE;
        END IF;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Inventory record not found for product %', v_product.id;
        END IF;

        IF (v_inventory.quantity - v_inventory.reserved) < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_product.id;
        END IF;

        UPDATE public.inventory_items
        SET quantity = quantity - v_quantity,
            updated_at = NOW()
        WHERE id = v_inventory.id;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            variant_id,
            quantity,
            price_at_purchase,
            product_snapshot
        ) VALUES (
            v_order_id,
            v_product.id,
            v_variant_id,
            v_quantity,
            v_unit_price,
            jsonb_build_object(
                'title', COALESCE(v_product.title->>'vi', v_product.title->>'en', ''),
                'image', v_product.image_url,
                'variantName', v_variant_name
            )
        );

        v_total := v_total + (v_unit_price * v_quantity);
    END LOOP;

    UPDATE public.orders
    SET total_amount = v_total
    WHERE id = v_order_id;

    RETURN jsonb_build_object('order_id', v_order_id, 'total_amount', v_total);
END;
$function$;

REVOKE ALL ON FUNCTION public.create_order_atomic(jsonb, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_order_atomic(jsonb, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(jsonb, jsonb) TO authenticated, service_role;

-- Close the direct PostgREST insertion bypass. The RPC is SECURITY DEFINER and
-- runs as postgres (table owner), so it does not need these policies.
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert items linked to their own order" ON public.order_items;
