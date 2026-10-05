-- Migration: 20261005160000_add_deleted_at_to_categories.sql
-- Description: Add deleted_at column for soft deletion of categories and index for query optimization

-- 1. Add deleted_at column to categories table if not exists
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- 2. Create index for query performance when filtering active categories
CREATE INDEX IF NOT EXISTS categories_deleted_at_idx ON public.categories (deleted_at);
