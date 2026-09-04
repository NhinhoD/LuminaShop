"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Monitor, Smartphone, Tablet, ExternalLink, ArrowLeft, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DemoViewerClientProps {
  product: {
    id: string;
    title: Record<string, string>;
    price: number;
    demoUrl: string;
  };
  resolvedIframeSrc: string;
  locale: "vi" | "en";
  buyNowText: string;
  backText: string;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

/**
 * Client-side demo viewer for product templates with responsive viewport switcher (desktop/tablet/mobile).
 * Renders an isolated sandbox iframe with navigation controls and purchase CTA.
 */
export default function DemoViewerClient({
  product,
  resolvedIframeSrc,
  locale,
  buyNowText,
  backText,
}: DemoViewerClientProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const productTitle = product.title[locale] || product.title.en || product.title.vi || "Template Demo";

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans select-none">
      {/* High-Fidelity Sandbox Top Bar */}
      <header className="h-14 w-full bg-slate-950/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
        
        {/* Left: Brand & Back link */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            href={`/product/${product.id}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10"
            title={backText}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">{backText}</span>
          </Link>

          <div className="h-4 w-px bg-white/15" />

          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-primary transition-colors">
              KhoUI
            </span>
            <span className="hidden md:inline-block text-[9px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full">
              Live Sandbox
            </span>
          </Link>
        </div>

        {/* Center: Interactive Device Viewport Switcher */}
        <div className="flex items-center bg-slate-900 border border-white/10 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setViewport("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewport === "desktop"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Desktop (100%)"
            type="button"
          >
            <Monitor size={14} />
            <span className="hidden lg:inline text-[11px]">Desktop</span>
          </button>

          <button
            onClick={() => setViewport("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewport === "tablet"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Tablet (768px)"
            type="button"
          >
            <Tablet size={14} />
            <span className="hidden lg:inline text-[11px]">Tablet</span>
          </button>

          <button
            onClick={() => setViewport("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewport === "mobile"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Mobile (375px)"
            type="button"
          >
            <Smartphone size={14} />
            <span className="hidden lg:inline text-[11px]">Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={resolvedIframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Open in new window"
          >
            <ExternalLink size={15} />
          </a>

          <Link
            href={`/product/${product.id}`}
            className="bg-primary hover:bg-primary-dark text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-md shadow-primary/30 flex items-center gap-1.5 active:scale-95"
          >
            <ShoppingBag size={13} />
            <span>{buyNowText}</span>
            <span className="hidden sm:inline font-mono opacity-85">
              • {formatCurrency(product.price, locale)}
            </span>
          </Link>
        </div>
      </header>

      {/* Simulator Viewport Area */}
      <main className="flex-grow w-full relative bg-slate-900/60 overflow-hidden flex items-center justify-center p-0 md:p-4">
        <div
          className={`h-full transition-all duration-300 ease-out bg-white overflow-hidden shadow-2xl relative ${
            viewport === "desktop"
              ? "w-full rounded-none md:rounded-xl border-0 md:border md:border-white/10"
              : viewport === "tablet"
              ? "w-[768px] max-w-full rounded-2xl border-4 border-slate-800 ring-1 ring-white/10"
              : "w-[375px] max-w-full rounded-3xl border-8 border-slate-800 ring-1 ring-white/10"
          }`}
        >
          <iframe
            src={resolvedIframeSrc}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-popups allow-forms"
            allow="autoplay; fullscreen; clipboard-read; clipboard-write; encrypted-media"
            title={`Live Demo of ${productTitle}`}
          />
        </div>
      </main>
    </div>
  );
}
