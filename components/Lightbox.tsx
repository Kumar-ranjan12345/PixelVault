"use client";

import { useEffect, useState } from "react";
import type { Photo } from "@/lib/r2";

interface Props {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isDemo?: boolean;
}

export default function Lightbox({ photo, onClose, onPrev, onNext, hasPrev, hasNext, isDemo = false }: Props) {
  const [downloading, setDownloading] = useState(false);

  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/download?url=${encodeURIComponent(photo.originalUrl)}&name=${encodeURIComponent(photo.name)}`
      );
      const { url } = await res.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.name;
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <p className="text-zinc-400 text-sm truncate max-w-xs">{photo.name}</p>
        <div className="flex items-center gap-3">
          {/* Download */}
          {isDemo ? (
            <span className="flex items-center gap-2 bg-zinc-800 text-zinc-500 text-sm font-medium px-4 py-2 rounded-full cursor-not-allowed" title="Connect R2 to enable downloads">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Demo
            </span>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download
            </button>
          )}
          {/* Close */}
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center relative px-12 min-h-0">
        {/* Prev */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Full-res image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.originalUrl}
          alt={photo.name}
          className="max-h-full max-w-full object-contain rounded-lg"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        />

        {/* Next */}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-2 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="px-4 py-3 flex-shrink-0 text-center">
        <p className="text-zinc-600 text-xs">
          {(photo.size / (1024 * 1024)).toFixed(1)} MB · {new Date(photo.uploadedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
