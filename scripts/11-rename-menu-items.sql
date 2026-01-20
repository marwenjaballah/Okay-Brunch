-- Migration script to rename menu_items to items
-- Actually run this in your Supabase SQL Editor

-- 1. Rename the main table
ALTER TABLE IF EXISTS menu_items RENAME TO items;

-- 2. Rename the column in order_items
ALTER TABLE IF EXISTS order_items RENAME COLUMN menu_item_id TO item_id;

-- 3. Rename policies for consistency
ALTER POLICY "Menu items are public" ON items RENAME TO "Items are public";
ALTER POLICY "Admins can manage menu items" ON items RENAME TO "Admins can manage items";

-- 4. Rename indexes for consistency
ALTER INDEX IF EXISTS idx_menu_items_category RENAME TO idx_items_category;

-- 5. Force PostgREST to reload schema (optional, but happens automatically usually)
-- NOTIFY pgrst, 'reload schema';
