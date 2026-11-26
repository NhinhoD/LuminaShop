"use client";

import type { ReactNode } from "react";

interface SplitLinesProps {
  /** One entry per visual line. Each line gets its own overflow mask. */
  readonly lines: readonly ReactNode[];
  readonly className?: string;
  readonly lineClassName?: string;
}

/**
 * Renders headline lines inside overflow-hidden masks so GSAP can slide each
 * line up from below (`yPercent: 110 -> 0`) without clipping ascenders.
 *
 * @param props - Lines, wrapper class and per-line class.
 * @returns Wrapper element containing masked lines.
 */
export function SplitLines({ lines, className, lineClassName }: SplitLinesProps): React.JSX.Element {
  return (
    <span className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden py-[0.18em] -my-[0.18em]">
          <span data-line className={`block ${lineClassName ?? ""}`}>
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
