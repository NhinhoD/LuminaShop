-- Migration: 20260906220000_cancel_pending_order_rpc.sql
-- Description: Create atomic RPC to cancel orders only when in pending and unpaid state, preventing concurrency race conditions

CREATE OR REPLACE FUNCTION public.cancel_pending_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_rows_updated integer;
BEGIN
    UPDATE public.orders
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_order_id
      AND status = 'pending'
      AND payment_status != 'paid';

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated = 0 THEN
        RETURN jsonb_build_object(
          'success', false, 
          'message', 'Không thể hủy đơn hàng. Đơn hàng không ở trạng thái chờ thanh toán hoặc đã được xử lý.'
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_pending_order(uuid) TO authenticated, service_role;
