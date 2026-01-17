-- Fix Infinite Recursion by using a Security Definer function

-- 1. Create a function to check if the user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/superuser)
-- thus bypassing RLS on the table it queries within.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy if it exists
DROP POLICY IF EXISTS "Admins can read all users data" ON users;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;

-- 3. Re-create policies using the safe function

-- Users Table
CREATE POLICY "Admins can read all users data" ON users FOR SELECT USING (
  is_admin()
);

-- Orders Table
CREATE POLICY "Admins can read all orders" ON orders FOR SELECT USING (
  is_admin()
);

CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (
  is_admin()
);

-- Order Items Table
CREATE POLICY "Admins can read all order items" ON order_items FOR SELECT USING (
  is_admin()
);

-- Note: No seed needed if you already ran the previous one, but just in case:
-- UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
