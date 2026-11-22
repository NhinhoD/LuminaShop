"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type GsapSetupCleanup = void | (() => void);

/**
 * Runs a GSAP setup function inside a scoped `gsap.context()`.
 *
 * The context is reverted automatically on unmount, which kills every tween,
 * timeline and ScrollTrigger created inside it. The setup callback may return
 * its own cleanup (for example to revert a `gsap.matchMedia()` instance).
 *
 * @param setup - Animation setup, receives the scoped root element.
 * @param scopeRef - Ref to the element that scopes selectors and cleanup.
 * @returns Nothing.
 */
export function useGsapEffect(
  setup: (scope: HTMLElement) => GsapSetupCleanup,
  scopeRef: RefObject<HTMLElement | null>
): void {
  const setupRef = useRef(setup);

  useEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      const cleanup = setupRef.current(scope);
      if (typeof cleanup === "function") {
        return cleanup;
      }
      return undefined;
    }, scope);

    return () => {
      ctx.revert();
    };
  }, [scopeRef]);
}
