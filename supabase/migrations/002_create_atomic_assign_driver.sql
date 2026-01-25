-- ============================================
-- ATOMIC DRIVER ASSIGNMENT FUNCTION
-- ============================================
-- Prevents race conditions when multiple drivers try to accept the same order
-- Uses row-level locking to ensure only one driver can accept an order

CREATE OR REPLACE FUNCTION public.atomic_assign_driver(
  p_order_id UUID,
  p_driver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_status TEXT;
  v_current_driver_id UUID;
  v_result JSONB;
BEGIN
  -- Lock the order row for update to prevent race conditions
  SELECT status, driver_id
  INTO v_order_status, v_current_driver_id
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE; -- Row-level lock

  -- Check if order exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;

  -- Check if order is in ready status
  IF v_order_status != 'ready' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Order is not ready for pickup. Current status: %s', v_order_status)
    );
  END IF;

  -- Check if order is already assigned
  IF v_current_driver_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order is already assigned to another driver'
    );
  END IF;

  -- Verify driver exists and is online
  IF NOT EXISTS (
    SELECT 1 FROM public.drivers
    WHERE id = p_driver_id
    AND is_online = true
    AND is_verified = true
    AND (on_hold IS NULL OR on_hold = false)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Driver is not available or not verified'
    );
  END IF;

  -- Assign driver to order atomically
  UPDATE public.orders
  SET
    driver_id = p_driver_id,
    status = 'assigned',
    assigned_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id
  AND status = 'ready'
  AND driver_id IS NULL;

  -- Check if update succeeded
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to assign driver (order may have been assigned by another driver)'
    );
  END IF;

  -- Log the event
  INSERT INTO public.order_events (
    order_id,
    status,
    actor_type,
    actor_id,
    notes
  ) VALUES (
    p_order_id,
    'assigned',
    'driver',
    p_driver_id,
    'Driver accepted delivery request'
  );

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'driver_id', p_driver_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.atomic_assign_driver(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.atomic_assign_driver IS 'Atomically assigns a driver to a ready order, preventing race conditions';
