-- Refine the Order Status Workflow
-- This replaces the old status check with the more granular lifecycle.

-- 1. Drop existing constraint so we can modify the data freely
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Migration: Map old statuses to the new universal workflow
-- 'paid' orders become 'pending' (as they are now 'pending' + payment_status='paid')
UPDATE orders SET status = 'pending' WHERE status = 'paid';
-- 'processing' becomes 'preparing'
UPDATE orders SET status = 'preparing' WHERE status = 'processing';
-- 'completed' becomes 'delivered'
UPDATE orders SET status = 'delivered' WHERE status = 'completed';

-- 3. Add the new strict constraint
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'pending',           -- Waiting for Confirmation
    'confirmed',         -- Accepted
    'preparing',         -- In Preparation
    'ready',             -- Ready for Delivery/Pickup
    'out_for_delivery',  -- On the Way
    'delivered',         -- Completed
    'cancelled'          -- Rejected
));
