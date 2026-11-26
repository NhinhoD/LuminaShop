"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ROUTES } from "@/shared/constants";
import { useGsapEffect } from "@/client/components/common/motion/useGsapEffect";
import { useRevealBatch } from "@/client/components/common/motion/useRevealBatch";
import type { SectionCopy } from "./types";

export interface CategoryEntry {
  readonly filter: string;
  readonly name: string;
  readonly count: string;
}

interface CategoryIndexProps extends SectionCopy {
  readonly categories: readonly CategoryEntry[];
  readonly active: string;
  readonly onSelect: (filter: string) => void;
  readonly previews: Readonly<Record<string, string | undefined>>;
}

/**
 * Numbered category index. Rows are keyboard-accessible buttons that filter the
 * catalogue; on fine pointers a preview image follows the cursor.
 *
 * @param props - Categories, active filter, handler and preview image map.
 * @returns Category index section.
 */
export function CategoryIndex({
  dict,
  categories,
  active,
  onSelect,
  previews,
}: CategoryIndexProps): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const ui = dict.homeUi;

  useRevealBatch(ref);

  useGsapEffect((scope) => {
    const mm = gsap.matchMedia();

    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const preview = previewRef.current;
      if (!preview) return;

      gsap.set(preview, { opacity: 0, scale: 0.96 });
      const xTo = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3.out" });

      const handleMove = (event: PointerEvent) => {
        const rect = scope.getBoundingClientRect();
        xTo(event.clientX - rect.left + 28);
        yTo(event.clientY - rect.top - 90);
      };

      const show = () => {
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
      };
      const hide = () => {
        gsap.to(preview, { opacity: 0, scale: 0.96, duration: 0.2, ease: "power2.out" });
      };

      scope.addEventListener("pointermove", handleMove);
      scope.addEventListener("pointerenter", show);
      scope.addEventListener("pointerleave", hide);

      return () => {
        scope.removeEventListener("pointermove", handleMove);
        scope.removeEventListener("pointerenter", show);
        scope.removeEventListener("pointerleave", hide);
      };
    });

    return () => mm.revert();
  }, ref);

  const previewSrc = hovered ? previews[hovered] : undefined;

  return (
    <section ref={ref} id="categories" className="relative border-b border-border py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="mb-10 grid grid-cols-1 gap-6 border-b border-border pb-6 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-7">
            <span className="mono-meta text-primary">{ui.categoriesIndex}</span>
            <h2 className="mt-3 display text-[clamp(1.9rem,3.6vw,3rem)] text-dark">{ui.categoriesTitle}</h2>
          </div>
          <div data-reveal className="flex flex-col justify-end gap-4 lg:col-span-5">
            <p className="max-w-sm text-[13px] leading-relaxed text-dark/55">{ui.categoriesDesc}</p>
            <Link
              href={ROUTES.SHOP}
              className="link-underline inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold text-primary"
            >
              <span>{ui.labelViewAll}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            ref={previewRef}
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 z-20 hidden w-[220px] overflow-hidden border border-dark bg-surface shadow-[0_24px_60px_-32px_rgba(11,11,15,0.6)] lg:block ${
              previewSrc ? "" : "invisible"
            }`}
          >
            <div className="relative aspect-[4/3]">
              {previewSrc ? (
                <Image src={previewSrc} alt="" fill sizes="220px" className="object-cover" />
              ) : null}
            </div>
          </div>

          {categories.map((category, index) => {
            const isActive = active === category.filter;
            return (
              <button
                key={category.filter}
                type="button"
                data-reveal
                onClick={() => onSelect(category.filter)}
                onMouseEnter={() => setHovered(category.filter)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(category.filter)}
                onBlur={() => setHovered(null)}
                aria-pressed={isActive}
                className={`group grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 border-t border-border py-5 text-left transition-colors sm:grid-cols-[3rem_1fr_9rem_auto] sm:gap-5 ${
                  isActive
                    ? "border-l-2 border-l-accent bg-dark pl-3 text-background sm:pl-4"
                    : "hover:bg-dark hover:text-background"
                }`}
              >
                <span
                  className={`mono-meta text-[10px] ${isActive ? "text-primary" : "text-dark/35 group-hover:text-primary"}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[1.6rem]">
                    {category.name}
                  </span>
                </span>

                <span className="mono-meta hidden text-[9px] text-dark/40 group-hover:text-background/45 sm:block">
                  {category.count}
                </span>

                <span className="flex items-center gap-4">
                  <span className="mono-meta text-[9px] text-dark/40 group-hover:text-background/45 sm:hidden">
                    {category.count}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-dark/25 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </span>
              </button>
            );
          })}

          <div className="border-t border-border" />
        </div>

        <p className="mono-meta mt-4 text-[8.5px] text-dark/35">{ui.categoriesHint}</p>
      </div>
    </section>
  );
}
