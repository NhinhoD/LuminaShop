"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProviderProps {
  readonly children: React.ReactNode;
}

/**
 * SmoothScrollProvider initializes Lenis inertia smooth scrolling
 * and synchronizes frame timing with GSAP ScrollTrigger and gsap.ticker.
 *
 * @param {SmoothScrollProviderProps} props - Component properties containing children.
 * @returns {React.JSX.Element} Provider wrapper rendering children.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps): React.JSX.Element {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Respect system accessibility setting for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll position events with GSAP ScrollTrigger calculations
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis requestAnimationFrame loop directly via GSAP's global ticker
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll to top upon client-side page navigation
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return <>{children}</>;
}
