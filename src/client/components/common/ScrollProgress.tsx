"use client";

/**
 * Fixed scroll-progress bar driven by CSS scroll-driven animations
 * (`animation-timeline: scroll()`), so it works without relying on
 * client-side hydration or JavaScript scroll listeners.
 *
 * @returns Scroll progress bar element.
 */
export function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[1002] h-[2px] w-full origin-left bg-primary scroll-progress"
    />
  );
}
