"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Image as ImageIcon } from "lucide-react";

interface ProductMediaGalleryProps {
  title: string;
  imageUrl?: string;
  demoUrl?: string;
}

export default function ProductMediaGallery({ title, imageUrl, demoUrl }: ProductMediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<"image" | "live">(demoUrl ? "live" : "image");
  const [iframeLoading, setIframeLoading] = useState(true);
  const [prevDemoUrl, setPrevDemoUrl] = useState(demoUrl);

  if (demoUrl !== prevDemoUrl) {
    setPrevDemoUrl(demoUrl);
    setIframeLoading(true);
  }

  return (
    <div className="space-y-6">
      {/* Tab Selectors (Only shown if demoUrl exists) */}
      {demoUrl && (
        <div className="flex border-b border-[#f0f0f0] pb-2 gap-8 font-poppins">
          <button
            onClick={() => {
              setActiveTab("live");
              setIframeLoading(true);
            }}
            type="button"
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer transition-colors ${
              activeTab === "live" ? "text-primary" : "text-[#999] hover:text-dark"
            }`}
          >
            <Monitor size={14} />
            <span>Live Interactive Demo</span>
            {activeTab === "live" && (
              <motion.div
                layoutId="activeMediaTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("image")}
            type="button"
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer transition-colors ${
              activeTab === "image" ? "text-primary" : "text-[#999] hover:text-dark"
            }`}
          >
            <ImageIcon size={14} />
            <span>Bản vẽ thiết kế</span>
            {activeTab === "image" && (
              <motion.div
                layoutId="activeMediaTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        </div>
      )}

      {/* Media Window Container */}
      <div className={`bg-cream rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-[#ece9e6] relative transition-all duration-500 ${
        activeTab === "live" && demoUrl
          ? "w-full h-[75vh] min-h-[500px]"
          : "aspect-[4/3] sm:aspect-[16/10]"
      }`}>
        {activeTab === "live" && demoUrl ? (
          <div className="w-full h-full relative bg-slate-950">
            {/* Top Browser Bar Mock */}
            <div className="h-9 bg-[#1e1e24] border-b border-slate-800 flex items-center px-4 gap-2 select-none">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-grow mx-12 bg-[#2d2d34] h-5 rounded-md flex items-center px-3 text-[9px] text-slate-400 font-mono overflow-hidden whitespace-nowrap text-ellipsis">
                {demoUrl}
              </div>
            </div>

            {/* Embedded Live Iframe sandbox */}
            <iframe
              src={demoUrl}
              title={`Live Preview of ${title}`}
              className="w-full h-[calc(100%-36px)] border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups"
              allow="autoplay; fullscreen; clipboard-read; clipboard-write; encrypted-media"
              onLoad={() => setIframeLoading(false)}
            />

            {/* Premium Loader Overlay */}
            <AnimatePresence>
              {iframeLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-x-0 bottom-0 top-9 bg-[#0b0e14]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="flex h-10 w-10 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent animate-spin"></span>
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <p className="text-xs font-semibold text-slate-200 uppercase tracking-widest font-poppins">
                      Loading Live Preview
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono mt-1 select-none">
                      rendering high-fidelity template designs...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {imageUrl ? (
              <Image
                alt={title}
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                src={imageUrl}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#ccc] text-6xl">
                🍽️
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extra helper notice for live frame */}
      {activeTab === "live" && demoUrl && (
        <p className="text-[10px] text-slate-400 font-medium text-center italic">
          💡 Bạn có thể trực tiếp cuộn, di chuột và tương tác với hiệu ứng GSAP trong hộp preview ở trên.
        </p>
      )}
    </div>
  );
}
