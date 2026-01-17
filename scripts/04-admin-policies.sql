-- 1. Policies for Admin Access

-- Admins can read all orders
CREATE POLICY "Admins can read all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can read all order items
CREATE POLICY "Admins can read all order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can update all users (to ban/promote? optional, strictly not asked but good for admin)
CREATE POLICY "Admins can read all users data" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);


-- 2. Admin Seed / Promotion
-- Instructions: Replace 'admin@okaybrunch.com' with the email of the user you want to be admin.
-- Or sign up as this user and then run this script.

UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@okaybrunch.com'; 

-- Verification: check who is admin
-- SELECT * FROM users WHERE role = 'admin';
