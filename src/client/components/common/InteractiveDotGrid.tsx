"use client";

import { useEffect, useRef } from "react";

// ─── Tuning constants ───────────────────────────────────────────────
const SPACING = 42;          // grid cell size (px)
const DOT_RADIUS = 1.8;      // dot draw radius (px)
const BASE_OPACITY = 0.60;   // base dot alpha — higher for visibility through overlays
const REPEL_RADIUS = 200;    // wider mouse influence (px)
const REPEL_STRENGTH = 5.0;  // stronger push
const SPRING = 0.035;        // slower spring → smoother snap-back
const DAMPING = 0.85;        // higher damping → glides, not bounces
// Dot color: blue-400 tone to match design system
const DOT_R = 107;
const DOT_G = 163;
const DOT_B = 214;

interface Dot {
  ox: number; oy: number; // original grid position
  x: number; y: number;  // current position
  vx: number; vy: number; // velocity
}

/**
 * InteractiveDotGrid
 *
 * Renders a full-viewport canvas (fixed) with a dot grid.
 * Dots repel away from the mouse cursor with spring physics.
 * Brightness increases proportionally with displacement.
 * Optimized to pause rendering when idle to save resources,
 * and respects 'prefers-reduced-motion' system preferences.
 */
export function InteractiveDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots: Dot[] = [];
    let animId: number;
    const mouse = { x: -9999, y: -9999 };

    // ── Build / rebuild dot grid to fill current viewport ──────────
    function buildGrid() {
      const w = (canvas!.width = window.innerWidth);
      const h = (canvas!.height = window.innerHeight);
      dots = [];
      for (let cx = SPACING / 2; cx < w + SPACING; cx += SPACING) {
        for (let cy = SPACING / 2; cy < h + SPACING; cy += SPACING) {
          dots.push({ ox: cx, oy: cy, x: cx, y: cy, vx: 0, vy: 0 });
        }
      }
    }

    // ── Main animation loop ─────────────────────────────────────────
    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let needsRedraw = false;

      for (const d of dots) {
        // Mouse repulsion force
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          // Quadratic falloff for smooth feel
          const t = 1 - dist / REPEL_RADIUS;
          const force = t * t * REPEL_STRENGTH;
          const angle = Math.atan2(dy, dx);
          d.vx += Math.cos(angle) * force;
          d.vy += Math.sin(angle) * force;
        }

        // Spring pull back to original position
        d.vx += (d.ox - d.x) * SPRING;
        d.vy += (d.oy - d.y) * SPRING;

        // Damping
        d.vx *= DAMPING;
        d.vy *= DAMPING;

        // Integrate
        d.x += d.vx;
        d.y += d.vy;

        // Brightness boost proportional to displacement
        const displacement = Math.sqrt((d.x - d.ox) ** 2 + (d.y - d.oy) ** 2);
        const alpha = Math.min(BASE_OPACITY + displacement * 0.018, 0.85);

        ctx!.beginPath();
        ctx!.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${DOT_R}, ${DOT_G}, ${DOT_B}, ${alpha})`;
        ctx!.fill();

        // Check if dot is still moving significantly
        if (Math.abs(d.vx) > 0.01 || Math.abs(d.vy) > 0.01 || dist < REPEL_RADIUS) {
          needsRedraw = true;
        }
      }

      if (needsRedraw) {
        animId = requestAnimationFrame(tick);
      } else {
        animId = 0; // Mark as idle
      }
    }

    // ── Event handlers ──────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!animId) tick(); // Resume animation if idle
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      if (!animId) tick(); // Resume to animate dots returning to origin
    };
    const onResize = () => {
      buildGrid();
      if (!animId) tick(); // Redraw static grid
    };

    // ── Bootstrap ───────────────────────────────────────────────────
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    buildGrid();
    
    if (prefersReducedMotion) {
      // Just draw the initial static grid once, no animation loop
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const d of dots) {
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${DOT_R}, ${DOT_G}, ${DOT_B}, ${BASE_OPACITY})`;
        ctx!.fill();
      }
      return; // Skip event listeners
    }

    tick();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none select-none"
      style={{ zIndex: 2 }}
    />
  );
}
