-- Harden SECURITY DEFINER / trigger functions exposed through PostgREST.
--
-- Findings (Supabase security advisor):
--   1. get_translation_namespaces() ran without a pinned search_path.
--   2. Trigger / event-trigger functions (handle_new_user, rls_auto_enable,
--      sync_product_inventory, sync_variant_inventory, sync_inventory_to_catalog,
--      sync_variants_stock_to_product) are fired by the engine but were
--      executable by PUBLIC/anon/authenticated via /rest/v1/rpc/*, allowing
--      arbitrary inventory/role mutations.
--   3. get_customer_kpis() was executable by anon, leaking store-wide revenue.
--
-- Note: complete_order_payment / cancel_pending_order are intentionally NOT
-- revoked from anon here. The PayOS webhook has no session and currently runs
-- as the anon role, so revoking anon would break webhook fulfilment. Closing
-- that hole requires a server-only service-role client (see follow-up).

-- 1. Pin search_path. Keep the function invoker-rights and publicly readable:
--    the public storefront loads translations without a session.
CREATE OR REPLACE FUNCTION public.get_translation_namespaces()
RETURNS TABLE(namespace text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT DISTINCT namespace
  FROM public.site_translations
  WHERE namespace IS NOT NULL
  ORDER BY namespace ASC;
$function$;

-- 2. Trigger / event-trigger functions are fired by the engine, never by a
--    client, so direct RPC access is revoked.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_product_inventory() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_variant_inventory() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_inventory_to_catalog() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_variants_stock_to_product() FROM PUBLIC, anon, authenticated;

-- 3. Store-wide revenue KPI: restrict to admins only.
--    Preserve the original TABLE return shape (total_spent numeric, vip_count
--    bigint) that a fresh database already has and that the dashboard consumer
--    expects. DROP + CREATE is required because PostgreSQL cannot change a
--    function's return type via CREATE OR REPLACE.
DROP FUNCTION IF EXISTS public.get_customer_kpis();

CREATE FUNCTION public.get_customer_kpis()
RETURNS TABLE (
    total_spent numeric,
    vip_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT COALESCE(SUM(o.total_amount), 0)
    INTO total_spent
    FROM public.orders o
    WHERE o.status IN ('delivered', 'completed', 'paid') OR o.payment_status = 'paid';

    SELECT COUNT(*)
    INTO vip_count
    FROM (
        SELECT o.user_id
        FROM public.orders o
        WHERE (o.status IN ('delivered', 'completed', 'paid') OR o.payment_status = 'paid')
          AND o.user_id IS NOT NULL
        GROUP BY o.user_id
        HAVING SUM(o.total_amount) >= 2000000
    ) sub;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_customer_kpis() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_customer_kpis() TO authenticated, service_role;
