-- Restrict trusted payment RPCs to the service role.
--
-- complete_order_payment() had no authorization check at all, and
-- cancel_pending_order() treated an unauthenticated request (anon, whose
-- auth.uid() is NULL) as a trusted "service_role" caller. Both were reachable
-- by anon/authenticated through /rest/v1/rpc/*, letting anyone fulfil a
-- "free" order or cancel other customers' pending orders.
--
-- The application now calls these RPCs through a server-only service-role
-- client (src/server/infrastructure/supabase/admin.ts) and enforces ownership
-- at the action/use-case layer. Direct PostgREST access is revoked.
--
-- IMPORTANT: apply only after SUPABASE_SERVICE_ROLE_KEY is configured in every
-- environment, otherwise webhook fulfilment and user payment flows will fail.

REVOKE ALL ON FUNCTION public.complete_order_payment(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_order_payment(uuid, uuid) TO service_role;

REVOKE ALL ON FUNCTION public.cancel_pending_order(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_pending_order(uuid) TO service_role;
