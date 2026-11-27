"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, useCallback } from "react";
import gsap from "gsap";

import { getLocalizedText } from "@/shared/utils/locale";
import type { Product } from "@/shared/types/product";
import type { Category } from "@/shared/types/category";
import type { vi } from "@/i18n/dictionaries/vi";
import { useI18n } from "@/client/components/common/I18nContext";
import { useGsapEffect } from "@/client/components/common/motion/useGsapEffect";
import { Counter } from "@/client/components/common/motion/Counter";
import { Marquee } from "@/client/components/common/motion/Marquee";
import { Hero } from "./sections/Hero";
import { CategoryIndex, type CategoryEntry } from "./sections/CategoryIndex";
import { Catalog, type CatalogTab } from "./sections/Catalog";
import { SpecSheet } from "./sections/SpecSheet";
import { Journey } from "./sections/Journey";
import { Reviews } from "./sections/Reviews";
import { Newsletter } from "./sections/Newsletter";
import { CURATED_SAMPLE_TEMPLATES } from "./samples";

interface HomePageClientProps {
  readonly featuredProducts: readonly Product[];
  readonly totalProducts?: number;
  readonly initialPage?: number;
  readonly initialCategory?: string;
  readonly categories: readonly Category[];
  readonly dict?: typeof vi;
}

const ITEMS_PER_PAGE = 6;
const CLIENT_COUNT = 1240;
const SPEED_SCORE = 99;
const TEMPLATE_COUNT = 50;

/**
 * Storefront landing page orchestrator.
 *
 * Owns URL-backed catalogue state (category + page), composes the numbered Spec
 * Sheet sections and wires the page-level scroll progress bar. Every animation
 * is scoped through `useGsapEffect`, so cleanup happens automatically.
 *
 * @param props - Server-provided products, categories, pagination and dictionary.
 * @returns Landing page tree.
 */
export default function HomePageClient({
  featuredProducts,
  totalProducts = featuredProducts.length,
  initialPage = 1,
  initialCategory = "all",
  categories,
  dict,
}: HomePageClientProps): React.JSX.Element {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);

  const [prevCategory, setPrevCategory] = useState(initialCategory);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  if (initialCategory !== prevCategory) {
    setPrevCategory(initialCategory);
    setActiveCategory(initialCategory);
  }

  const [prevPage, setPrevPage] = useState(initialPage);
  const [currentPage, setCurrentPage] = useState(initialPage);
  if (initialPage !== prevPage) {
    setPrevPage(initialPage);
    setCurrentPage(initialPage);
  }

  const [isPending, startTransition] = useTransition();
  const { dict: contextDict, locale } = useI18n();
  const copy = dict ?? contextDict;
  const ui = copy.homeUi;

  const formatCount = useCallback(
    (value: number) => Math.round(value).toLocaleString(locale === "vi" ? "vi-VN" : "en-US"),
    [locale]
  );

  useGsapEffect((scope) => {
    const bar = scope.querySelector<HTMLElement>("[data-scroll-progress]");
    if (!bar) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.25,
          },
        }
      );

      return () => {
        tween.kill();
      };
    });

    return () => mm.revert();
  }, containerRef);

  const shouldShowSamples =
    activeCategory === "all" && totalProducts === 0 && featuredProducts.length === 0;

  const displayProducts: readonly Product[] =
    totalProducts > 0 || featuredProducts.length > 0
      ? featuredProducts
      : shouldShowSamples
        ? CURATED_SAMPLE_TEMPLATES
        : [];

  const totalCount = totalProducts > 0 ? totalProducts : displayProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const heroSpecimens =
    displayProducts.length > 0 ? displayProducts : CURATED_SAMPLE_TEMPLATES;

  /**
   * Pushes a new page index to the URL without losing the active category.
   *
   * @param newPage - Target 1-based page.
   */
  const handlePageChange = (newPage: number): void => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;

    setCurrentPage(newPage);
    startTransition(() => {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== "all") {
        params.set("category", activeCategory);
      }
      params.set("page", newPage.toString());
      router.push(`/?${params.toString()}#showcase`, { scroll: false });
    });

    if (showcaseRef.current) {
      const rect = showcaseRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight / 2) {
        const _b = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"; showcaseRef.current.scrollIntoView({ behavior: _b, block: "start" });
      }
    }
  };

  /**
   * Applies a category filter, resets pagination and mirrors the state in the URL.
   *
   * @param categoryFilter - Category id or "all".
   */
  const handleCategorySelect = (categoryFilter: string): void => {
    setActiveCategory(categoryFilter);
    setCurrentPage(1);
    startTransition(() => {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }
      params.set("page", "1");
      router.push(`/?${params.toString()}#showcase`, { scroll: false });
    });

    if (showcaseRef.current) {
      const _b = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"; showcaseRef.current.scrollIntoView({ behavior: _b, block: "start" });
    }
  };

  const allCategoryCount = categories.reduce(
    (sum, category) => sum + (category.productCount ?? 0),
    0
  );

  const categoryEntries: readonly CategoryEntry[] = [
    {
      filter: "all",
      name: copy.home.categories.all,
      count: `${String(allCategoryCount > 0 ? allCategoryCount : totalCount).padStart(2, "0")} ${ui.labelTemplates}`,
    },
    ...categories.map((category) => ({
      filter: category.id,
      name: getLocalizedText(category.name as unknown as Record<string, string>, locale),
      count: `${String(category.productCount ?? 0).padStart(2, "0")} ${ui.labelTemplates}`,
    })),
  ];

  const catalogTabs: readonly CatalogTab[] = categoryEntries.map((entry) => ({
    filter: entry.filter,
    label: entry.name,
    count: entry.count,
  }));

  const previews: Record<string, string | undefined> = {
    all: displayProducts.find((product) => product.imageUrl)?.imageUrl,
  };
  for (const category of categories) {
    const match = displayProducts.find((product) => product.categoryId === category.id && product.imageUrl);
    previews[category.id] = match?.imageUrl;
  }

  const stats = [
    {
      key: "templates",
      value: TEMPLATE_COUNT,
      suffix: "+",
      label: ui.statsTemplates,
    },
    {
      key: "speed",
      value: SPEED_SCORE,
      suffix: "/100",
      label: ui.statsSpeed,
    },
    {
      key: "clients",
      value: CLIENT_COUNT,
      suffix: "+",
      label: ui.statsClients,
    },
  ] as const;

  return (
    <div ref={containerRef} className="isolate relative">
      <div
        data-scroll-progress
        aria-hidden="true"
        className="fixed left-0 top-0 z-[1000] h-[2px] w-full origin-left bg-primary motion-reduce:hidden"
        style={{ transform: "scaleX(0)" }}
      />

      <Hero
        dict={copy}
        locale={locale}
        specimens={heroSpecimens.slice(0, 3)}
        totalTemplates={totalCount > 0 ? totalCount : TEMPLATE_COUNT}
      />

      {/* Proof strip */}
      <section className="border-b border-border bg-background-subtle/50">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-border px-5 sm:px-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.key}
              data-reveal
              className="flex flex-col gap-1.5 py-5 pr-4 first:pl-0 lg:px-6"
            >
              <span className="mono-meta text-[8px] text-dark/35">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex items-baseline gap-1 font-display text-[1.6rem] font-bold leading-none tracking-[-0.04em] text-dark sm:text-[1.9rem]">
                <Counter
                  value={stat.value}
                  format={formatCount}
                />
                <span className="font-mono text-[11px] font-medium text-primary">{stat.suffix}</span>
              </span>
              <span className="text-[11px] leading-snug text-dark/50">{stat.label}</span>
            </div>
          ))}

          <div data-reveal className="flex flex-col gap-1.5 border-t border-border py-5 pr-4 lg:border-t-0 lg:px-6">
            <span className="mono-meta text-[8px] text-dark/35">04</span>
            <span className="font-display text-[1.6rem] font-bold leading-none tracking-[-0.04em] text-dark sm:text-[1.9rem]">
              24/7
            </span>
            <span className="text-[11px] leading-snug text-dark/50">{ui.statsDelivery}</span>
          </div>
        </div>
      </section>

      <CategoryIndex
        dict={copy}
        locale={locale}
        categories={categoryEntries}
        active={activeCategory}
        onSelect={handleCategorySelect}
        previews={previews}
      />

      <Catalog
        dict={copy}
        locale={locale}
        products={displayProducts}
        tabs={catalogTabs}
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        isPending={isPending}
        onPageChange={handlePageChange}
        sectionRef={showcaseRef}
      />

      {/* Single marquee band per page */}
      <div className="border-b border-border bg-dark text-background">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-3 sm:px-8">
          <span className="mono-meta hidden shrink-0 border border-background/25 px-2 py-1 text-[8px] text-background/55 sm:inline">
            {ui.marqueeLabel}
          </span>
          <Marquee
            items={[
              ui.labelInstant,
              ui.labelLicense,
              ui.labelSource,
              ui.labelVerified,
              ui.labelPremium,
            ]}
            separator="/"
            className="min-w-0 flex-1"
            itemClassName="mono-meta text-[9.5px] tracking-[0.18em] text-background/70"
          />
        </div>
      </div>

      <SpecSheet dict={copy} locale={locale} />
      <Journey dict={copy} locale={locale} />
      <Reviews dict={copy} locale={locale} />
      <Newsletter dict={copy} locale={locale} />
    </div>
  );
}
