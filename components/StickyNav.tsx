"use client";

import { useEffect, useState } from "react";

interface Props {
  photoCount: number;
}

export default function StickyNav({ photoCount }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sticky top-0 px-6 sm:px-10 py-4 flex items-center justify-between transition-all duration-300"
      style={{
        background: scrolled ? "rgba(13, 11, 9, 0.55)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      }}
    >
      <span className="text-white text-sm font-semibold tracking-[0.2em] uppercase">PixelVault</span>
      <span className="font-script text-xl text-zinc-300">Kumar&apos;s Photo Gallery</span>
      <span className="text-zinc-500 text-xs">{photoCount} photos</span>
    </div>
  );
}
