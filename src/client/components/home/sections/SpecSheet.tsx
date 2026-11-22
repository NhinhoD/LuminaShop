"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useGsapEffect } from "@/client/components/common/motion/useGsapEffect";
import { useRevealBatch } from "@/client/components/common/motion/useRevealBatch";
import type { SectionCopy } from "./types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Technical spec sheet: a sticky package summary beside four numbered
 * specification rows. On desktop the row nearest the viewport centre receives
 * an ink highlight driven by ScrollTrigger; with reduced motion every row stays
 * in its resting state.
 *
 * @param props - Copy and locale.
 * @returns Specification section.
 */
export function SpecSheet({ dict }: SectionCopy): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const ui = dict.homeUi;

  useRevealBatch(ref);

  useGsapEffect((scope) => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const rows = Array.from(scope.querySelectorAll<HTMLElement>("[data-spec-row]"));
      if (rows.length === 0) return;

      const triggers = rows.map((row) =>
        ScrollTrigger.create({
          trigger: row,
          start: "top 58%",
          end: "bottom 42%",
          onToggle: (self) => {
            row.classList.toggle("is-active", self.isActive);
          },
        })
      );

      return () => {
        rows.forEach((row) => row.classList.remove("is-active"));
        triggers.forEach((trigger) => trigger.kill());
      };
    });

    return () => mm.revert();
  }, ref);

  const specs = [
    {
      index: "01",
      title: ui.spec1Title,
      desc: ui.spec1Desc,
      meta: ui.spec1Meta,
    },
    {
      index: "02",
      title: ui.spec2Title,
      desc: ui.spec2Desc,
      meta: ui.spec2Meta,
    },
    {
      index: "03",
      title: ui.spec3Title,
      desc: ui.spec3Desc,
      meta: ui.spec3Meta,
    },
    {
      index: "04",
      title: ui.spec4Title,
      desc: ui.spec4Desc,
      meta: ui.spec4Meta,
    },
  ];

  return (
    <section
      id="specs"
      ref={ref}
      className="relative scroll-mt-20 overflow-hidden border-b border-border bg-primary/5 py-16 sm:py-24"
    >
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div data-reveal className="lg:sticky lg:top-24">
              <span className="mono-meta text-primary">{ui.specsIndex}</span>
              <h2 className="mt-3 display text-[clamp(1.7rem,3.4vw,2.8rem)] text-dark">
                {ui.specsTitle}
              </h2>
              <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-dark/55">
                {ui.specsDesc}
              </p>

              <div className="mt-8 max-w-sm border border-dark/15 bg-surface/80">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="mono-meta text-[8.5px] text-dark/45">{ui.specsAsideLabel}</span>
                  <span className="mono-meta text-[8.5px] text-primary">{ui.labelVerified}</span>
                </div>
                <pre className="overflow-x-auto p-3 font-mono text-[10.5px] leading-relaxed text-dark/65">
{`template-package/
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── README.txt`}
                </pre>
                <p className="border-t border-border px-3 py-2.5 text-[11px] leading-relaxed text-dark/45">
                  {ui.specsAsideNote}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-dark/15">
              {specs.map((spec) => (
                <div
                  key={spec.index}
                  data-spec-row
                  data-reveal
                  className="spec-row group border-b border-dark/15"
                >
                  <div className="grid grid-cols-[2.25rem_1fr] gap-4 px-1 py-6 sm:grid-cols-[3rem_1fr_10.5rem] sm:items-start sm:gap-6 sm:px-3 sm:py-7">
                    <span className="spec-cell-index mono-meta pt-1 text-[10px] text-dark/35">
                      {spec.index}
                    </span>

                    <div>
                      <h3 className="spec-cell-strong font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.03em] text-dark sm:text-[1.3rem]">
                        {spec.title}
                      </h3>
                      <p className="spec-cell-muted mt-2 max-w-xl text-[12.5px] leading-relaxed text-dark/55">
                        {spec.desc}
                      </p>
                    </div>

                    <span className="spec-cell-muted mono-meta col-start-2 mt-1 text-[8.5px] leading-relaxed text-dark/40 sm:col-start-auto sm:mt-1.5 sm:text-right">
                      {spec.meta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
