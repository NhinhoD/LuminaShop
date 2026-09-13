-- Migration: 20260913100000_add_unique_constraint_products_slug.sql
-- Description: Enforce unique index on products.slug to prevent duplicate product slugs and ensure query integrity

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON public.products (slug);
