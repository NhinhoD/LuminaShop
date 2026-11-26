"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapEffect } from "./useGsapEffect";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseRevealBatchOptions {
  readonly selector?: string;
  /** Vertical offset in pixels before the reveal starts. */
  readonly y?: number;
  /** ScrollTrigger start position. */
  readonly start?: string;
  /** Delay between siblings inside one batch. */
  readonly stagger?: number;
}

/**
 * Reveals every `[data-reveal]` element inside the scope exactly once when it
 * enters the viewport. Uses `ScrollTrigger.batch` so a whole row animates with
 * a single ScrollTrigger instead of one trigger per card.
 *
 * Elements start hidden only when motion is allowed; with reduced motion they
 * are forced to their final state so content is never invisible.
 *
 * @param scopeRef - Ref to the section root.
 * @param options - Selector and timing overrides.
 * @returns Nothing.
 */
export function useRevealBatch(
  scopeRef: RefObject<HTMLElement | null>,
  options: UseRevealBatchOptions = {}
): void {
  const { selector = "[data-reveal]", y = 26, start = "top 88%", stagger = 0.06 } = options;

  useGsapEffect((scope) => {
    const targets = Array.from(scope.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(targets, { opacity: 0, y });

      ScrollTrigger.batch(targets, {
        start,
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger,
            overwrite: true,
          });
        },
      });
    });

    return () => mm.revert();
  }, scopeRef);
}
