"use client";

import { useRef } from "react";
import { Star } from "lucide-react";

import { useRevealBatch } from "@/client/components/common/motion/useRevealBatch";
import type { SectionCopy } from "./types";

/**
 * Editorial review wall. Three numbered quotes on paper cards with hairline
 * rules, technology stamps and a five-star signal.
 *
 * @param props - Copy and locale.
 * @returns Reviews section.
 */
export function Reviews({ dict }: SectionCopy): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const ui = dict.homeUi;

  useRevealBatch(ref);

  const reviews = [
    {
      index: "01",
      quote: ui.quote1,
      author: ui.author1,
      role: ui.role1,
      tech: ui.tech1,
    },
    {
      index: "02",
      quote: ui.quote2,
      author: ui.author2,
      role: ui.role2,
      tech: ui.tech2,
    },
    {
      index: "03",
      quote: ui.quote3,
      author: ui.author3,
      role: ui.role3,
      tech: ui.tech3,
    },
  ];

  return (
    <section ref={ref} className="relative border-b border-border py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="mb-10 grid grid-cols-1 gap-6 border-b border-border pb-6 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-7">
            <span className="mono-meta text-primary">{ui.reviewsIndex}</span>
            <h2 className="mt-3 display text-[clamp(1.9rem,3.6vw,3rem)] text-dark">
              {ui.reviewsTitle}
            </h2>
          </div>
          <div data-reveal className="flex items-end lg:col-span-5">
            <p className="max-w-sm text-[13px] leading-relaxed text-dark/55">{ui.reviewsDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.index}
              data-reveal
              className="group flex flex-col bg-surface p-5 transition-colors hover:bg-background sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="mono-meta text-[9px] text-dark/35">{review.index}</span>
                <span className="flex items-center gap-0.5 text-primary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={9} fill="currentColor" />
                  ))}
                </span>
              </div>

              <p
                aria-hidden="true"
                className="mt-4 font-display text-[2.5rem] font-bold leading-none tracking-[-0.06em] text-dark/12"
              >
                &ldquo;
              </p>

              <blockquote className="-mt-3 text-[13px] leading-relaxed text-dark/70">
                {review.quote}
              </blockquote>

              <div className="mt-auto border-t border-border pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[12.5px] font-semibold leading-tight text-dark">
                      {review.author}
                    </p>
                    <p className="mono-meta mt-1.5 text-[8px] text-dark/40">{review.role}</p>
                  </div>
                  <span className="mono-meta shrink-0 border border-border px-1.5 py-1 text-[8px] text-dark/50">
                    {review.tech}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
