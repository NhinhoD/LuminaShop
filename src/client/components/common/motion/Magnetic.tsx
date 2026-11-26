"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGsapEffect } from "./useGsapEffect";

interface MagneticProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Maximum pointer offset multiplier (0.15–0.35 feels premium). */
  readonly strength?: number;
}

/**
 * Wraps interactive content with a subtle pointer-following translation.
 *
 * Only enabled for fine pointers without reduced-motion preference, and the
 * transform is written through `gsap.quickTo` so repeated pointer events reuse
 * a single tween instead of allocating new ones.
 *
 * @param props - Children, class and strength.
 * @returns Inline-flex wrapper that can be transformed.
 */
export function Magnetic({ children, className, strength = 0.24 }: MagneticProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useGsapEffect((scope) => {
    const mm = gsap.matchMedia();

    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const xTo = gsap.quickTo(scope, "x", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(scope, "y", { duration: 0.45, ease: "power3.out" });

      const handleMove = (event: PointerEvent) => {
        const rect = scope.getBoundingClientRect();
        const relX = event.clientX - (rect.left + rect.width / 2);
        const relY = event.clientY - (rect.top + rect.height / 2);
        xTo(relX * strength);
        yTo(relY * strength);
      };

      const handleLeave = () => {
        xTo(0);
        yTo(0);
      };

      scope.addEventListener("pointermove", handleMove);
      scope.addEventListener("pointerleave", handleLeave);

      return () => {
        scope.removeEventListener("pointermove", handleMove);
        scope.removeEventListener("pointerleave", handleLeave);
      };
    });

    return () => mm.revert();
  }, ref);

  return (
    <div ref={ref} className={`inline-flex will-change-transform ${className ?? ""}`}>
      {children}
    </div>
  );
}
