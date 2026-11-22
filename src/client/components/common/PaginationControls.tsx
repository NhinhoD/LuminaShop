"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/client/components/common/I18nContext";

export interface PaginationControlsProps {
  /** Current active page (1-based) */
  readonly currentPage: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Total number of items across all pages (optional, used for item counter) */
  readonly totalItems?: number;
  /** Number of items displayed per page (optional, used for item counter) */
  readonly itemsPerPage?: number;
  /** Optional callback for client-controlled pagination. If omitted, Next.js Link navigation is used. */
  readonly onPageChange?: (page: number) => void;
  /** Whether pagination transition is in progress (e.g. useTransition) */
  readonly isPending?: boolean;
  /** Optional hash anchor to append to URL, e.g. 'showcase' -> '#showcase' */
  readonly anchor?: string;
  /** Retained for API compatibility; the Spec Sheet style uses no spring capsule. */
  readonly layoutId?: string;
  /** Label for item counter, e.g. "template" or { vi: "template", en: "templates" } */
  readonly itemName?: string | { vi: string; en: string };
  /** Explicitly toggle item counter display */
  readonly showItemCount?: boolean;
  /** Additional container classes */
  readonly className?: string;
  /** Whether to show top border line (default: true) */
  readonly bordered?: boolean;
  /** Scroll behavior for Link navigation (default: true) */
  readonly scroll?: boolean;
}

/**
 * Computes the page numbers array with smart ellipsis windowing.
 *
 * @param currentPage - Active 1-based page.
 * @param totalPages - Total page count.
 * @returns Visible page numbers and ellipsis markers.
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

const CONTROL_BASE =
  "flex h-8 w-8 items-center justify-center border text-[11px] font-medium transition-colors";
const CONTROL_IDLE =
  "border-border bg-surface text-dark/65 hover:border-dark hover:text-dark";
const CONTROL_DISABLED = "border-border/60 bg-background-subtle/40 text-dark/20 cursor-not-allowed select-none";

/**
 * Hairline pagination control.
 *
 * Supports both server-driven `Link` navigation and a client callback. Active
 * page is marked with `aria-current`; disabled edges use spans so keyboard focus
 * cannot land on an inert action.
 *
 * @param props - Page state, navigation mode and copy overrides.
 * @returns Pagination row or null when there is nothing to paginate.
 */
export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isPending = false,
  anchor,
  itemName,
  showItemCount,
  className = "",
  bordered = true,
  scroll = true,
}: PaginationControlsProps): React.JSX.Element | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useI18n();

  const shouldShowCount = showItemCount ?? (totalItems !== undefined && totalItems > 0);
  const resolvedItemName =
    typeof itemName === "object"
      ? locale === "vi"
        ? itemName.vi
        : itemName.en
      : itemName || (locale === "vi" ? "kết quả" : "items");

  if (totalPages <= 1) {
    if (!shouldShowCount || totalItems === undefined || totalItems <= 0) return null;

    return (
      <div
        className={`flex items-center justify-between gap-4 pt-5 font-sans ${
          bordered ? "border-t border-border" : ""
        } ${className}`}
      >
        <p className="mono-meta text-[9px] text-dark/40">
          {locale === "vi" ? "Hiển thị" : "Showing"}{" "}
          <span className="text-dark">1 – {totalItems}</span> / {totalItems} {resolvedItemName}
        </p>
      </div>
    );
  }

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const isPrevDisabled = safeCurrentPage <= 1 || isPending;
  const isNextDisabled = safeCurrentPage >= totalPages || isPending;

  const from =
    totalItems && totalItems > 0 && itemsPerPage
      ? (safeCurrentPage - 1) * itemsPerPage + 1
      : 1;
  const to =
    totalItems && totalItems > 0 && itemsPerPage
      ? Math.min(safeCurrentPage * itemsPerPage, totalItems)
      : totalItems;

  const pageNumbers = getPageNumbers(safeCurrentPage, totalPages);

  const createPageUrl = (pageNumber: number): string => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("page", pageNumber.toString());
    const cleanAnchor = anchor ? (anchor.startsWith("#") ? anchor : `#${anchor}`) : "";
    return `${pathname}?${params.toString()}${cleanAnchor}`;
  };

  const previousLabel = locale === "vi" ? "Trang trước" : "Previous page";
  const nextLabel = locale === "vi" ? "Trang sau" : "Next page";

  return (
    <div
      className={`flex flex-col items-center gap-4 pt-5 font-sans sm:flex-row sm:justify-between ${
        bordered ? "border-t border-border" : ""
      } ${className}`}
    >
      {shouldShowCount && totalItems !== undefined ? (
        <p className="mono-meta order-2 text-[9px] text-dark/40 sm:order-1">
          {locale === "vi" ? "Hiển thị" : "Showing"}{" "}
          <span className="text-dark">
            {from} – {to}
          </span>{" "}
          / {totalItems} {resolvedItemName}
        </p>
      ) : (
        <span className="order-2 hidden sm:order-1 sm:block" />
      )}

      <nav aria-label={locale === "vi" ? "Phân trang" : "Pagination"} className="order-1 flex items-center gap-1 sm:order-2">
        {onPageChange ? (
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={isPrevDisabled}
            aria-label={previousLabel}
            className={`${CONTROL_BASE} ${isPrevDisabled ? CONTROL_DISABLED : CONTROL_IDLE}`}
          >
            <ChevronLeft size={14} />
          </button>
        ) : isPrevDisabled ? (
          <span aria-disabled="true" aria-label={previousLabel} className={`${CONTROL_BASE} ${CONTROL_DISABLED}`}>
            <ChevronLeft size={14} />
          </span>
        ) : (
          <Link href={createPageUrl(safeCurrentPage - 1)} scroll={scroll} aria-label={previousLabel} className={`${CONTROL_BASE} ${CONTROL_IDLE}`}>
            <ChevronLeft size={14} />
          </Link>
        )}

        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} aria-hidden="true" className="flex h-8 w-6 items-center justify-center text-[11px] text-dark/30">
                …
              </span>
            );
          }

          const isActive = page === safeCurrentPage;
          const className = isActive
            ? `${CONTROL_BASE} border-dark bg-dark text-background`
            : `${CONTROL_BASE} ${CONTROL_IDLE}`;

          if (onPageChange) {
            return (
              <button
                key={page}
                type="button"
                disabled={isPending}
                onClick={() => onPageChange(page)}
                aria-current={isActive ? "page" : undefined}
                className={`${className} ${isPending ? "cursor-wait opacity-60" : ""}`}
              >
                {page}
              </button>
            );
          }

          return (
            <Link
              key={page}
              href={createPageUrl(page)}
              scroll={scroll}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {page}
            </Link>
          );
        })}

        {onPageChange ? (
          <button
            type="button"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={isNextDisabled}
            aria-label={nextLabel}
            className={`${CONTROL_BASE} ${isNextDisabled ? CONTROL_DISABLED : CONTROL_IDLE}`}
          >
            <ChevronRight size={14} />
          </button>
        ) : isNextDisabled ? (
          <span aria-disabled="true" aria-label={nextLabel} className={`${CONTROL_BASE} ${CONTROL_DISABLED}`}>
            <ChevronRight size={14} />
          </span>
        ) : (
          <Link href={createPageUrl(safeCurrentPage + 1)} scroll={scroll} aria-label={nextLabel} className={`${CONTROL_BASE} ${CONTROL_IDLE}`}>
            <ChevronRight size={14} />
          </Link>
        )}
      </nav>
    </div>
  );
}
