-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions if not already granted (standard for authenticated users)
GRANT ALL ON users TO authenticated;
