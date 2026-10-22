-- Align the owner-cancellation policy with the payment_status values the app
-- actually writes ('unpaid' / 'failed' / 'paid'), instead of the stale
-- 'pending' value that never occurs. Keep the transition limited to
-- pending -> cancelled and forbid touching paid orders.

DROP POLICY IF EXISTS "Users can only cancel own pending order" ON public.orders;

CREATE POLICY "Users can only cancel own pending order" ON public.orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND status = 'pending'
  AND payment_status <> 'paid'
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'cancelled'
  AND payment_status <> 'paid'
);
