-- The inventory RPCs below are dead code: the wired checkout path
-- (create_order_atomic) manages inventory internally, and neither
-- ReserveStock/ReleaseStock use-cases nor makeInventoryRepository are
-- referenced anywhere in the app. They were still granted to PUBLIC (and
-- therefore anon) via PostgREST, letting anyone mutate stock levels.
REVOKE ALL ON FUNCTION public.increment_inventory_quantity(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_stock(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_stock(uuid, integer) FROM PUBLIC, anon, authenticated;
