-- Fix: get_customer_kpis() was declared RETURNS TABLE but never executed
-- RETURN NEXT, so the RPC returned zero rows and the dashboard consumer fell
-- back to empty KPIs.
--
-- The return type is unchanged, so CREATE OR REPLACE is safe here.

CREATE OR REPLACE FUNCTION public.get_customer_kpis()
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

    RETURN NEXT;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_customer_kpis() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_customer_kpis() TO authenticated, service_role;
