"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

import { ROUTES } from "@/shared/constants";
import { useGsapEffect } from "@/client/components/common/motion/useGsapEffect";
import { useRevealBatch } from "@/client/components/common/motion/useRevealBatch";
import type { SectionCopy } from "./types";

/**
 * Three-step workflow timeline. A hairline rail fills as the section scrolls,
 * while each step reveals with a small stagger.
 *
 * @param props - Copy and locale.
 * @returns Workflow section.
 */
export function Journey({ dict }: SectionCopy): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const ui = dict.homeUi;

  useRevealBatch(ref);

  useGsapEffect((scope) => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const line = scope.querySelector<HTMLElement>("[data-journey-line]");
      if (!line) return;

      const tween = gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top 72%",
            end: "bottom 76%",
            scrub: 0.7,
          },
        }
      );

      return () => {
        tween.kill();
      };
    });

    return () => mm.revert();
  }, ref);

  const steps = [
    {
      index: "01",
      title: dict.home.journey.step1Title,
      desc: dict.home.journey.step1Desc,
      meta: ui.journeyMeta1,
    },
    {
      index: "02",
      title: dict.home.journey.step2Title,
      desc: dict.home.journey.step2Desc,
      meta: ui.journeyMeta2,
    },
    {
      index: "03",
      title: dict.home.journey.step3Title,
      desc: dict.home.journey.step3Desc,
      meta: ui.journeyMeta3,
    },
  ];

  return (
    <section className="relative border-b border-border py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="mb-12 grid grid-cols-1 gap-6 border-b border-border pb-6 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-7">
            <span className="mono-meta text-primary">{ui.journeyIndex}</span>
            <h2 className="mt-3 display text-[clamp(1.9rem,3.6vw,3rem)] text-dark">
              {ui.journeyTitle}
            </h2>
          </div>
          <div data-reveal className="flex items-end justify-start gap-4 lg:col-span-5 lg:justify-end">
            <Link
              href={ROUTES.SHOP}
              className="link-underline inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary"
            >
              <span>{ui.labelViewAll}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-[3.25rem] hidden h-px bg-dark/12 md:block"
          >
            <div
              data-journey-line
              className="h-full origin-left bg-primary"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step) => (
              <article key={step.index} data-reveal className="group relative bg-background">
                <span className="mono-meta flex h-7 w-fit items-center border border-dark/20 px-2 text-[9px] text-dark/55 transition-colors group-hover:border-dark group-hover:bg-dark group-hover:text-background">
                  {step.index}
                </span>

                <div className="mt-5 border-t border-dark/15 pt-4">
                  <h3 className="font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-dark sm:text-[1.5rem]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-dark/55">{step.desc}</p>
                  <p className="mono-meta mt-5 text-[8.5px] text-primary">{step.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
