"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBreadcrumbs } from "./BreadcrumbContext";
import { ROUTES } from "@/shared/constants";
import { ChevronRight } from "lucide-react";

/**
 * Automatic breadcrumb trail for storefront routes.
 *
 * Renders a hairline spec-sheet strip with mono labels. Navigation behaviour
 * (history back when referred from the same route) is unchanged.
 *
 * @returns Breadcrumb strip, or null on the homepage.
 */
export function AutoBreadcrumbs(): React.JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const { customLabels } = useBreadcrumbs();

  if (pathname === ROUTES.HOME) return null;

  const segments = pathname.split("/").filter((v) => v.length > 0);

  const breadcrumbs = [
    { label: "Home", href: ROUTES.HOME },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      let label = customLabels[href] || (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
      if (!customLabels[href] && segment.length > 20) label = "Detail";
      return { label, href };
    }),
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
    if (typeof document !== "undefined" && document.referrer.includes(href)) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <div className="border-b border-border bg-background font-sans">
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex max-w-[1440px] items-center gap-1.5 overflow-x-auto px-5 py-2.5 sm:px-8"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={item.href} className="flex shrink-0 items-center gap-1.5">
              {index > 0 && (
                <ChevronRight size={11} className="shrink-0 select-none text-dark/25" />
              )}

              {isLast ? (
                <span className="mono-meta max-w-[160px] truncate text-[8px] text-dark" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className="mono-meta text-[8px] text-dark/40 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
