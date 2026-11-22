"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGsapEffect } from "./useGsapEffect";

interface CounterProps {
  readonly value: number;
  readonly format: (value: number) => string;
  readonly className?: string;
  readonly duration?: number;
}

/**
 * Counts from zero to `value` once the element enters the viewport.
 *
 * The final value is rendered on the server (and under reduced motion) so the
 * text is always readable without JavaScript.
 *
 * @param props - Target value, formatter, class and duration.
 * @returns Span containing the formatted number.
 */
export function Counter({ value, format, className, duration = 1.6 }: CounterProps): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);

  useGsapEffect((scope) => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      scope.textContent = format(value);
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const state = { current: 0 };
      const tween = gsap.to(state, {
        current: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          scope.textContent = format(state.current);
        },
        scrollTrigger: {
          trigger: scope,
          start: "top 92%",
          once: true,
        },
      });

      return () => tween.kill();
    });

    return () => mm.revert();
  }, ref);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
