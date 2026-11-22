"use client";

import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import { ArrowUpRight, ExternalLink, Monitor } from "lucide-react";

import { ROUTES } from "@/shared/constants";
import { formatCurrency, resolveCleanPreviewUrl } from "@/shared/utils";
import { getLocalizedText } from "@/shared/utils/locale";
import type { Product } from "@/shared/types/product";
import { PaginationControls } from "@/client/components/common/PaginationControls";
import { useRevealBatch } from "@/client/components/common/motion/useRevealBatch";
import type { SectionCopy } from "./types";

export interface CatalogTab {
  readonly filter: string;
  readonly label: string;
  readonly count: string;
}

interface CatalogProps extends SectionCopy {
  readonly products: readonly Product[];
  readonly tabs: readonly CatalogTab[];
  readonly activeCategory: string;
  readonly onSelectCategory: (filter: string) => void;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly itemsPerPage: number;
  readonly isPending: boolean;
  readonly onPageChange: (page: number) => void;
  readonly sectionRef: RefObject<HTMLElement | null>;
}

/**
 * Resolves the display title of a product, tolerating legacy string payloads.
 *
 * @param product - Product record from the catalogue.
 * @param locale - Active UI locale.
 * @returns Localized product title.
 */
function titleOf(product: Product, locale: SectionCopy["locale"]): string {
  return typeof product.title === "string"
    ? product.title
    : getLocalizedText(product.title as unknown as Record<string, string>, locale);
}

/**
 * Resolves the display description of a product, tolerating legacy payloads.
 *
 * @param product - Product record from the catalogue.
 * @param locale - Active UI locale.
 * @returns Localized product description.
 */
function descriptionOf(product: Product, locale: SectionCopy["locale"]): string {
  return typeof product.description === "string"
    ? product.description
    : getLocalizedText(product.description as unknown as Record<string, string>, locale);
}

/**
 * Catalogue section: numbered filter rail plus a hairline product grid.
 *
 * Cards are real browser-frame specimens with demo/details actions. Filter
 * selection and pagination are delegated to the page orchestrator so URL state
 * stays the single source of truth.
 *
 * @param props - Products, tabs, active filter and pagination handlers.
 * @returns Catalogue section.
 */
export function Catalog({
  dict,
  locale,
  products,
  tabs,
  activeCategory,
  onSelectCategory,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  isPending,
  onPageChange,
  sectionRef,
}: CatalogProps): React.JSX.Element {
  const ui = dict.homeUi;

  useRevealBatch(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative scroll-mt-20 border-b border-border py-16 sm:py-20"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="mb-8 grid grid-cols-1 gap-6 border-b border-border pb-6 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-7">
            <span className="mono-meta text-primary">{ui.catalogIndex}</span>
            <h2 className="mt-3 display text-[clamp(1.9rem,3.6vw,3rem)] text-dark">
              {ui.catalogTitle}
            </h2>
          </div>
          <div data-reveal className="flex flex-col justify-end gap-3 lg:col-span-5">
            <p className="mono-meta text-[9px] text-dark/45">
              {String(totalItems).padStart(2, "0")} {ui.labelTemplates} / {ui.labelSource}
            </p>
            <Link
              href={ROUTES.SHOP}
              className="link-underline inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold text-primary"
            >
              <span>{ui.labelViewAll}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Filter rail */}
        <div className="-mx-1 mb-8 flex snap-x gap-1.5 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.filter;
            return (
              <button
                key={tab.filter}
                type="button"
                onClick={() => onSelectCategory(tab.filter)}
                aria-pressed={isActive}
                className={`group inline-flex shrink-0 snap-start items-center gap-2 border px-3 py-2 transition-colors ${
                  isActive
                    ? "border-dark bg-dark text-background"
                    : "border-border bg-surface text-dark/65 hover:border-dark hover:text-dark"
                }`}
              >
                <span className="text-[11.5px] font-medium leading-none">{tab.label}</span>
                <span
                  className={`mono-meta text-[8.5px] ${
                    isActive ? "text-primary" : "text-dark/35 group-hover:text-dark/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {products.length > 0 ? (
          <div
            aria-busy={isPending}
            className={`grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 ${
              isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {products.map((product, index) => {
              const isFree = product.price === 0;
              const title = titleOf(product, locale);
              const description = descriptionOf(product, locale);
              const serial = String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, "0");

              return (
                <article
                  key={product.id}
                  data-reveal
                  className="group flex flex-col bg-surface transition-colors hover:bg-background"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dark/15" />
                      <span className="mono-meta ml-1 truncate text-[8px] text-dark/35">
                        khoui.demo / {product.slug || product.id}
                      </span>
                    </span>
                    <span
                      className={`mono-meta shrink-0 text-[8px] ${
                        isFree ? "text-success" : "text-primary"
                      }`}
                    >
                      {isFree ? ui.labelFree : ui.labelPremium}
                    </span>
                  </div>

                  <Link
                    href={`${ROUTES.PRODUCT}/${product.id}`}
                    className="relative block aspect-[16/10] overflow-hidden border-b border-border bg-background-subtle"
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center bg-dark text-background/35">
                        <Monitor size={26} />
                      </span>
                    )}

                    <span className="mono-meta absolute bottom-2.5 right-2.5 border border-dark/15 bg-surface/95 px-1.5 py-1 text-[8px] text-dark/70 backdrop-blur-sm">
                      {ui.labelInstant}
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="mono-meta text-[8.5px] text-dark/35">
                        {ui.labelSpec} {serial}
                      </span>
                      <span className="mono-meta text-[9px] text-dark/40">
                        {product.techStack?.length ? product.techStack[0] : ui.labelSource}
                      </span>
                    </div>

                    <Link href={`${ROUTES.PRODUCT}/${product.id}`} className="mt-1.5">
                      <h3 className="truncate font-display text-[1.05rem] font-semibold leading-tight tracking-[-0.03em] text-dark transition-colors group-hover:text-primary">
                        {title}
                      </h3>
                    </Link>

                    <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[12px] leading-relaxed text-dark/55">
                      {description || ui.labelLicense}
                    </p>

                    {product.techStack?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {product.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="border border-border px-1.5 py-1 text-[9.5px] leading-none text-dark/55"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3.5">
                      <div className="min-w-0">
                        <span className="mono-meta block text-[8px] text-dark/35">
                          {ui.labelLicense}
                        </span>
                        <span className="mt-1 flex items-baseline gap-1">
                          <span className="font-mono text-[13px] font-semibold text-dark">
                            {isFree ? ui.labelFree : formatCurrency(product.price, locale)}
                          </span>
                          {isFree ? null : (
                            <span className="text-[10px] text-dark/35">{ui.labelPerLifetime}</span>
                          )}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {product.demoUrl ? (
                          <a
                            href={resolveCleanPreviewUrl(product.demoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${ui.labelDemo}: ${title}`}
                            className="flex h-8 items-center gap-1 border border-border px-2.5 text-[10.5px] font-medium text-dark/65 transition-colors hover:border-dark hover:text-dark"
                          >
                            <span>{ui.labelDemo}</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : null}
                        <Link
                          href={`${ROUTES.PRODUCT}/${product.id}`}
                          className="flex h-8 items-center gap-1 bg-dark px-3 text-[10.5px] font-semibold text-background transition-colors hover:bg-primary"
                        >
                          <span>{ui.labelDetails}</span>
                          <ArrowUpRight size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            data-reveal
            className="flex flex-col items-start gap-3 border border-dashed border-border bg-surface/60 p-8 sm:p-12"
          >
            <span className="mono-meta text-primary">{ui.catalogEmptyTitle}</span>
            <p className="max-w-md text-[13px] leading-relaxed text-dark/55">
              {ui.catalogEmptyDesc}
            </p>
            <Link
              href={ROUTES.SHOP}
              className="inline-flex h-10 items-center gap-1.5 bg-dark px-4 text-[11.5px] font-semibold text-background transition-colors hover:bg-primary"
            >
              <span>{ui.labelViewAll}</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        )}

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          isPending={isPending}
          itemName={dict.homeUi.labelTemplates}
          layoutId="home-catalog-page"
          className="mt-10"
        />
      </div>
    </section>
  );
}
