"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";

import { ROUTES } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";
import { getLocalizedText } from "@/shared/utils/locale";
import type { Product } from "@/shared/types/product";
import { useGsapEffect } from "@/client/components/common/motion/useGsapEffect";
import { Magnetic } from "@/client/components/common/motion/Magnetic";
import { SplitLines } from "@/client/components/common/motion/SplitLines";
import type { SectionCopy } from "./types";

interface HeroProps extends SectionCopy {
  readonly specimens: readonly Product[];
  readonly totalTemplates: number;
}

const CARD_POSITIONS = [
  "left-0 top-2 w-[80%]",
  "right-0 top-[31%] w-[74%]",
  "bottom-0 left-[6%] w-[72%]",
];

const CARD_ROTATIONS = ["-4", "3", "-2"];

interface SpecimenCardProps extends SectionCopy {
  readonly product: Product;
  readonly index: number;
}

function SpecimenCard({ product, index, locale, dict }: SpecimenCardProps): React.JSX.Element {
  const ui = dict.homeUi;
  const title = getLocalizedText(product.title, locale);
  const isFree = product.price === 0;

  return (
    <Link
      href={`/product/${product.id}`}
      data-hero-card
      data-rotate={CARD_ROTATIONS[index]}
      style={{ zIndex: 30 - index }}
      className={`absolute ${CARD_POSITIONS[index]} group border border-dark/20 bg-surface shadow-[0_24px_60px_-38px_rgba(11,11,15,0.7)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:z-50 hover:scale-[1.04] hover:border-primary hover:shadow-[0_32px_80px_-30px_rgba(27,42,255,0.45)]`}
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-background-subtle px-3 py-2 transition-colors group-hover:bg-primary/5">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="h-1.5 w-1.5 rounded-full bg-dark/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-dark/20" />
        <span className="mono-meta ml-1.5 truncate text-[8px] text-dark/35 group-hover:text-dark/60">
          khoui.demo / {product.slug || product.id}
        </span>
        <ArrowUpRight
          size={11}
          className="ml-auto text-dark/25 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <div className="relative aspect-[16/10] overflow-hidden bg-background-subtle">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={title}
            fill
            sizes="(max-width: 1024px) 60vw, 340px"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-dark">
            <span className="mono-meta text-[9px] text-background/40">{ui.labelPreview}</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="pointer-events-none absolute bottom-2 left-2.5 mono-meta text-[8px] text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {ui.labelSpec} {String(index + 1).padStart(3, "0")} · {title}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors group-hover:bg-primary/5">
        <div className="min-w-0">
          <p className="mono-meta text-[8px] text-dark/35">{ui.labelSpec} {String(index + 1).padStart(3, "0")}</p>
          <p className="truncate text-[12px] font-semibold leading-tight text-dark">{title}</p>
        </div>
        <span className="mono-meta shrink-0 text-[10px] text-primary">
          {isFree ? ui.labelFree : formatCurrency(product.price, locale)}
        </span>
      </div>
    </Link>
  );
}

/**
 * Catalogue-cover hero: oversized three-line headline on the left, a stack of
 * real template specimens on the right. There is no decorative 3D render — the
 * previews are the product.
 *
 * @param props - Copy, locale and the specimen products.
 * @returns Hero section.
 */
export function Hero({ dict, locale, specimens, totalTemplates }: HeroProps): React.JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const ui = dict.homeUi;

  useGsapEffect((scope) => {
    const mm = gsap.matchMedia();
    const lines = scope.querySelectorAll<HTMLElement>("[data-line]");
    const fades = scope.querySelectorAll<HTMLElement>("[data-hero-fade]");
    const cards = scope.querySelectorAll<HTMLElement>("[data-hero-card]");
    const cardList = Array.from(cards);
    const stack = scope.querySelector<HTMLElement>("[data-hero-stack]");

    const slotTransforms = [
      { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
      { x: 40, y: 28, scale: 0.9, rotation: 0, opacity: 0.6 },
      { x: -24, y: 56, scale: 0.8, rotation: 0, opacity: 0.3 },
    ];

    const applySlots = (active: number) => {
      cardList.forEach((card, idx) => {
        const slot = (idx - active + cardList.length) % cardList.length;
        const t = slotTransforms[slot] ?? slotTransforms[2];
        const rot = Number(card.dataset.rotate ?? 0);
        gsap.to(card, {
          x: t.x,
          y: t.y,
          scale: t.scale,
          rotation: rot,
          opacity: t.opacity,
          duration: 0.9,
          ease: "power3.inOut",
          overwrite: "auto",
        });
        card.style.zIndex = String(30 - slot * 10);
      });
    };

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(lines, { yPercent: 0, opacity: 1 });
      gsap.set(fades, { opacity: 1, y: 0 });
      gsap.set(cards, { opacity: 1, y: 0, scale: 1, x: 0 });
      gsap.set(cards, {
        rotate: (_index, element) => Number((element as HTMLElement).dataset.rotate ?? 0),
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: 1.05, stagger: 0.085 })
        .fromTo(fades, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 }, "-=0.6")
        .fromTo(
          cards,
          { opacity: 0, y: 48, scale: 0.97, rotate: 0 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: (_index, element) => Number((element as HTMLElement).dataset.rotate ?? 0),
            duration: 1.05,
            stagger: 0.11,
            ease: "expo.out",
          },
          "-=0.7"
        );

      gsap.to("[data-hero-stack]", {
        yPercent: -7,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      // initial slot layout after entrance
      gsap.delayedCall(1.2, () => applySlots(0));

      // Auto-rotate slideshow (GSAP-driven, pauses on hover) - only under normal motion
      let activeIndex = 0;
      let paused = false;
      let delayed: gsap.core.Tween | null = null;

      const schedule = () => {
        if (delayed) delayed.kill();
        if (paused || cardList.length <= 1) return;
        delayed = gsap.delayedCall(3, () => {
          activeIndex = (activeIndex + 1) % cardList.length;
          applySlots(activeIndex);
          schedule();
        });
      };

      const startTimer = gsap.delayedCall(4.2, () => {
        if (!paused) schedule();
      });

      const onEnter = () => {
        paused = true;
        if (delayed) { delayed.kill(); delayed = null; }
      };
      const onLeave = () => {
        paused = false;
        schedule();
      };
      stack?.addEventListener('pointerenter', onEnter);
      stack?.addEventListener('pointerleave', onLeave);

      return () => {
        if (delayed) delayed.kill();
        startTimer.kill();
        stack?.removeEventListener('pointerenter', onEnter);
        stack?.removeEventListener('pointerleave', onLeave);
      };
    });

    return () => mm.revert();
  }, ref);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-border">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-6 py-6 lg:grid-cols-12 lg:gap-10 lg:py-8">
          {/* Copy */}
          <div className="lg:col-span-7">
            <div data-hero-fade className="mb-7 flex flex-wrap items-center gap-3">
              <span className="mono-meta flex items-center gap-2 text-dark/55">
                <span className="h-1.5 w-1.5 bg-primary" />
                {ui.heroIndex}
              </span>
              <span aria-hidden="true" className="h-px w-10 bg-primary" />
              <span className="mono-meta text-dark/40">{ui.heroAvailability}</span>
            </div>

            <h1 className="display text-[clamp(1.8rem,4vw,3.2rem)] text-dark">
              <SplitLines
                lines={[
                  ui.heroTitle1,
                  <span key="accent" className="text-primary">{ui.heroTitle2}</span>,
                  ui.heroTitle3,
                ]}
              />
            </h1>

            <p data-hero-fade className="mt-5 max-w-md text-[13.5px] leading-relaxed text-dark/60 sm:text-sm">
              {dict.home.hero.desc}
            </p>

            <div data-hero-fade className="mt-6 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link
                  href={ROUTES.SHOP}
                  className="inline-flex h-12 items-center gap-2 bg-primary px-6 text-[12px] font-semibold text-background transition-colors hover:bg-dark"
                >
                  <span>{dict.home.hero.cta1}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href="#specs"
                  className="inline-flex h-12 items-center gap-2 border border-dark/25 px-6 text-[12px] font-semibold text-dark transition-colors hover:border-dark"
                >
                  <span>{dict.home.hero.cta2}</span>
                </a>
              </Magnetic>
            </div>

            <div data-hero-fade className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex text-primary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={10} fill="currentColor" />
                  ))}
                </span>
                <span className="mono-meta text-[9px] text-dark/45">{ui.heroRating}</span>
              </div>
              <span className="mono-meta text-[9px] text-dark/40">{ui.heroSpecsLine}</span>
            </div>
          </div>

          {/* Specimen stack */}
          <div className="relative lg:col-span-5">
            <div data-hero-fade className="mb-3 flex items-end justify-between">
              <span className="mono-meta text-[9px] text-dark/40">
                {ui.heroSpecimen} / {String(totalTemplates).padStart(2, "0")}
              </span>
              <span className="mono-meta flex items-center gap-1.5 text-[9px] text-primary">
                <span className="h-1.5 w-1.5 bg-primary" />
                {ui.labelLive}
              </span>
            </div>

            <div
              data-hero-stack
              className="relative mx-auto h-[340px] w-full max-w-[380px] sm:h-[400px]"
            >
              {specimens.slice(0, 3).map((product, index) => (
                <SpecimenCard
                  key={product.id}
                  product={product}
                  index={index}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>

            <div data-hero-fade className="mt-5 flex items-center justify-between border-t border-border pt-3">
              <span className="mono-meta text-[9px] text-dark/40">{ui.heroScroll}</span>
              <ArrowDown size={13} className="text-dark/35" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
