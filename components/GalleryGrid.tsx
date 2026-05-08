"use client";

import { useState } from "react";
import type { Photo } from "@/lib/imagekit";
import { CATEGORIES } from "@/lib/imagekit";
import Lightbox from "./Lightbox";

const PAGE_SIZE = 12;

export default function GalleryGrid({ photos: initialPhotos, isOwner = false }: { photos: Photo[]; isOwner?: boolean }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = activeCategory === "All" ? photos : photos.filter(p => p.category === activeCategory);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const usedCategories = CATEGORIES.filter(c => c === "All" || photos.some(p => p.category === c));

  function open(photo: Photo, index: number) {
    const globalIndex = filtered.indexOf(paged[index]);
    setSelected(photo);
    setSelectedIndex(globalIndex);
  }

  function prev() {
    const i = (selectedIndex - 1 + filtered.length) % filtered.length;
    setSelected(filtered[i]);
    setSelectedIndex(i);
    setPage(Math.floor(i / PAGE_SIZE) + 1);
  }

  function next() {
    const i = (selectedIndex + 1) % filtered.length;
    setSelected(filtered[i]);
    setSelectedIndex(i);
    setPage(Math.floor(i / PAGE_SIZE) + 1);
  }

  function onDeleted(key: string) {
    setPhotos(photos.filter(p => p.key !== key));
    setSelected(null);
  }

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeCategory(cat: string) {
    setActiveCategory(cat);
    setPage(1);
  }

  return (
    <>
      {/* Category filters — horizontal scroll on mobile */}
      {usedCategories.length > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {usedCategories.map(cat => (
            <button
              key={cat}
              onClick={() => changeCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeCategory === cat
                  ? "bg-amber-500 text-black font-medium border border-amber-500"
                  : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 text-xs opacity-50">{photos.filter(p => p.category === cat).length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Masonry grid with entrance animation */}
      <div className="masonry w-full">
        {paged.map((photo, i) => (
          <div
            key={photo.key}
            className="masonry-item group relative cursor-crosshair overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/5"
            onClick={() => open(photo, i)}
          >
            {/* Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnailUrl}
              alt={photo.name}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-1">
              {photo.location && (
                <p className="font-script text-white text-lg leading-tight truncate drop-shadow-lg">
                  {photo.location}
                </p>
              )}
              {photo.category && (
                <span className="self-start px-2.5 py-0.5 rounded-full text-xs tracking-widest uppercase bg-white/15 text-white/90 backdrop-blur-sm border border-white/20 font-light">
                  {photo.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {paged.length === 0 && (
        <div className="text-center py-20 text-zinc-600 text-sm">No photos in this category yet</div>
      )}

      {/* Numbered pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 mb-4">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-full text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                p === page ? "bg-amber-500 text-black border border-amber-500" : "text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-full text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {selected && (
        <Lightbox
          photo={selected}
          onClose={() => setSelected(null)}
          onPrev={prev}
          onNext={next}
          hasPrev={filtered.length > 1}
          hasNext={filtered.length > 1}
          isOwner={isOwner}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}
