import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AppRouterContext,
  type AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext, SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import HomePageClient from './HomePageClient';
import type { Product } from '@/shared/types/product';
import type { Category } from '@/shared/types/category';
import { vi } from '@/i18n/dictionaries/vi';

const NOW = new Date('2026-01-01T00:00:00.000Z');

function makeProduct(overrides: Partial<Product> & Pick<Product, 'id'>): Product {
  const { id, ...rest } = overrides;
  return {
    id,
    categoryId: 'cat-ecommerce',
    title: { vi: `Sản phẩm ${id}`, en: `Product ${id}` },
    slug: id,
    description: { vi: 'Mô tả sản phẩm', en: 'Product description' },
    price: 499000,
    stock: 10,
    imageUrl: `/images/${id}.webp`,
    isActive: true,
    demoUrl: 'https://demo.khoui.com/preview',
    sourceCodeUrl: 'https://example.com/source.zip',
    techStack: ['HTML5', 'Bootstrap 5'],
    createdAt: NOW,
    updatedAt: NOW,
    ...rest,
  };
}

function makeCategory(id: string, name: string, productCount: number): Category {
  return {
    id,
    name: { vi: name, en: name },
    slug: id,
    productCount,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

type HomeProps = React.ComponentProps<typeof HomePageClient>;

function renderHome(overrides: Partial<HomeProps> = {}): string {
  const router: AppRouterInstance = {
    bfcacheId: '',
    back() {},
    forward() {},
    refresh() {},
    push() {},
    replace() {},
    prefetch() {},
  };

  const props: HomeProps = {
    featuredProducts: [],
    categories: [],
    initialCategory: 'all',
    ...overrides,
  };

  function Probe(): null {
    return HomePageClient(props) as unknown as null;
  }

  return renderToStaticMarkup(
    React.createElement(
      AppRouterContext.Provider,
      { value: router },
      React.createElement(
        PathnameContext.Provider,
        { value: '/' },
        React.createElement(
          SearchParamsContext.Provider,
          { value: new URLSearchParams() },
          React.createElement(Probe)
        )
      )
    )
  );
}

describe('HomePageClient — Spec Sheet landing page', () => {
  it('composes the numbered catalogue sections without the legacy texture layer', () => {
    const html = renderHome();

    assert.match(html, /id="categories"/);
    assert.match(html, /id="showcase"/);
    assert.match(html, /id="specs"/);
    assert.match(html, /data-scroll-progress/);
    assert.match(html, /data-spec-row/);
    assert.doesNotMatch(html, /NewUI\.webp/);
    assert.doesNotMatch(html, /InteractiveDotGrid/);
    assert.match(html, new RegExp(vi.homeUi.specsTitle));
  });

  it('renders localized category rows and keeps the active filter pressed', () => {
    const html = renderHome({
      categories: [makeCategory('cat-ecommerce', 'E-Commerce', 12)],
      initialCategory: 'cat-ecommerce',
    });

    assert.match(html, /E-Commerce/);
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, /aria-pressed="false"/);
    assert.match(html, new RegExp(vi.homeUi.categoriesTitle));
  });

  it('renders product cards with detail links and localized prices', () => {
    const html = renderHome({
      featuredProducts: [
        makeProduct({ id: 'p-paid', title: { vi: 'Mẫu trả phí', en: 'Paid template' } }),
        makeProduct({ id: 'p-free', price: 0, title: { vi: 'Mẫu miễn phí', en: 'Free template' } }),
      ],
      totalProducts: 2,
      initialPage: 1,
    });

    assert.match(html, /Mẫu trả phí/);
    assert.match(html, /Mẫu miễn phí/);
    assert.match(html, /href="\/product\/p-paid"/);
    assert.match(html, /href="\/product\/p-free"/);
    assert.match(html, new RegExp(vi.homeUi.labelFree));
    assert.match(html, new RegExp(vi.homeUi.labelDetails));
  });

  it('shows the catalogue empty state when the filtered category has no products', () => {
    const html = renderHome({ initialCategory: 'empty-category' });

    assert.match(html, new RegExp(vi.homeUi.catalogEmptyTitle));
    assert.match(html, new RegExp(vi.homeUi.catalogEmptyDesc));
  });

  it('falls back to curated specimens only when the whole catalogue is empty', () => {
    const html = renderHome({ initialCategory: 'all' });

    assert.match(html, /E-Commerce Storefront Template/);
    assert.doesNotMatch(html, new RegExp(vi.homeUi.catalogEmptyTitle));
  });

  it('renders URL-backed pagination and the visible item range', () => {
    const products = Array.from({ length: 6 }, (_, index) =>
      makeProduct({ id: `page-two-${index + 1}` })
    );
    const html = renderHome({
      featuredProducts: products,
      totalProducts: 14,
      initialPage: 2,
    });

    assert.match(html, /aria-current="page"/);
    assert.match(html, /Hiển thị/);
    assert.match(html, /7/);
    assert.match(html, /12/);
    assert.match(html, /\/ 14/);
  });

  it('renders the newsletter form and the single delivery marquee band', () => {
    const html = renderHome();

    assert.match(html, /id="newsletter_email"/);
    assert.match(html, new RegExp(vi.home.newsletter.button));
    assert.equal((html.match(/animate-marquee\b/g) ?? []).length, 1);
  });
});
