-- Migration: 20260913100000_add_unique_constraint_products_slug.sql
-- Description: Enforce unique index on products.slug, resolving any duplicate slugs prior to index creation

-- 1. Deduplicate any existing duplicate non-NULL slugs by appending a short ID suffix
WITH duplicates AS (
    SELECT id,
           slug,
           ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC, id ASC) AS rn
    FROM public.products
    WHERE slug IS NOT NULL
)
UPDATE public.products p
SET slug = p.slug || '-' || SUBSTRING(p.id::text, 1, 8),
    updated_at = NOW()
FROM duplicates d
WHERE p.id = d.id AND d.rn > 1;

-- 2. Enforce unique index on public.products (slug) if not exists
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON public.products (slug);
