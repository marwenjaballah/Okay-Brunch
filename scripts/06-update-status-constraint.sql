-- Update the Check Constraint for Order Status
-- This ensures 'paid', 'processing', 'delivered', etc. are all valid.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'processing', 'delivered', 'completed', 'cancelled'));

-- Verification step (optional)
-- SELECT * FROM orders LIMIT 1;
