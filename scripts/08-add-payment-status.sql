-- Add payment_status column to orders
-- This allows tracking if a cash order has been paid even if delivered.

-- 1. Add column with default 'unpaid'
ALTER TABLE orders 
ADD COLUMN payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid'));

-- 2. Initialize existing orders
-- If status was 'paid', it means Stripe already processed it.
UPDATE orders SET payment_status = 'paid' WHERE status = 'paid';

-- 3. Add index for performance
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
