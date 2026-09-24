-- ============================================================
-- MIGRATION: Add item_id and item_type to user_library table
-- Run this in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/ufbaokhbfntlkvyzgses/sql/new
-- ============================================================

-- Step 1: Add item_id column (text, to support non-UUID novel/comic IDs)
ALTER TABLE public.user_library 
  ADD COLUMN IF NOT EXISTS item_id TEXT;

-- Step 2: Add item_type column  
ALTER TABLE public.user_library 
  ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'novel';

-- Step 3: Make original_id nullable (it will be NULL for new entries using item_id)
ALTER TABLE public.user_library 
  ALTER COLUMN original_id DROP NOT NULL;

-- Step 4: Add unique constraint to prevent duplicate saves per user
ALTER TABLE public.user_library
  DROP CONSTRAINT IF EXISTS user_library_user_item_unique;

ALTER TABLE public.user_library
  ADD CONSTRAINT user_library_user_item_unique 
  UNIQUE (user_id, item_id);

-- Step 5: Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_library'
ORDER BY ordinal_position;
