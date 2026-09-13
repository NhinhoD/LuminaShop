-- Migration: 20260913100000_add_unique_constraint_products_slug.sql
-- Description: Enforce unique index on products.slug, using collision-safe loop resolution for duplicate slugs prior to index creation

-- 1. Deduplicate any existing duplicate non-NULL slugs using a collision-safe iterative loop
DO $$
DECLARE
    r RECORD;
    v_new_slug text;
    v_counter integer;
BEGIN
    FOR r IN
        WITH duplicates AS (
            SELECT id,
                   slug,
                   ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC, id ASC) AS rn
            FROM public.products
            WHERE slug IS NOT NULL
        )
        SELECT id, slug
        FROM duplicates
        WHERE rn > 1
    LOOP
        -- Use full UUID to guarantee uniqueness
        v_new_slug := r.slug || '-' || r.id::text;
        v_counter := 1;

        -- Check against any existing slug in the table and increment counter until conflict is eliminated
        WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = v_new_slug AND id <> r.id) LOOP
            v_counter := v_counter + 1;
            v_new_slug := r.slug || '-' || r.id::text || '-' || v_counter;
        END LOOP;

        UPDATE public.products
        SET slug = v_new_slug,
            updated_at = NOW()
        WHERE id = r.id;
    END LOOP;
END $$;

-- 2. Enforce unique index on public.products (slug) if not exists
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON public.products (slug);
