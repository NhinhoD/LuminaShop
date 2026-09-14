-- Migration: Add RPC functions for customer KPIs and translation namespaces
-- Description: Offloads aggregation and distinct scanning to PostgreSQL engine for optimal performance

CREATE OR REPLACE FUNCTION public.get_customer_kpis()
RETURNS TABLE (
  total_spent NUMERIC,
  vip_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH customer_spending AS (
    SELECT
      user_id,
      SUM(total_amount) AS user_total
    FROM orders
    WHERE (status IN ('delivered', 'completed', 'paid') OR payment_status = 'paid')
      AND user_id IS NOT NULL
    GROUP BY user_id
  )
  SELECT
    COALESCE(SUM(user_total), 0)::NUMERIC AS total_spent,
    COUNT(CASE WHEN user_total >= 2000000 THEN 1 END)::BIGINT AS vip_count
  FROM customer_spending;
$$;

REVOKE EXECUTE ON FUNCTION public.get_customer_kpis() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_customer_kpis() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_translation_namespaces()
RETURNS TABLE (
  namespace TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT namespace
  FROM site_translations
  WHERE namespace IS NOT NULL
  ORDER BY namespace ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_translation_namespaces() TO authenticated, service_role, anon;
