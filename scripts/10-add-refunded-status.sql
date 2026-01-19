-- Update payment_status to include 'refunded'
-- This allows for better tracking of cancelled orders that were already paid.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('paid', 'unpaid', 'refunded'));
