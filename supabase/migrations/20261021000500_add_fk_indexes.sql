-- Performance: cover foreign keys flagged by the Supabase performance advisor.
-- Without these, FK checks and joins degrade to sequential scans as tables grow.

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items (variant_id);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts (user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON public.inventory_items (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_variant_id ON public.inventory_items (variant_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items (variant_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);

-- Remove the duplicate unique index. The products_slug_key unique constraint
-- already provides an equivalent index for products.slug.
DROP INDEX IF EXISTS public.products_slug_unique_idx;
