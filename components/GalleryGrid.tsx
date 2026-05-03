"use client";

import { useState } from "react";
import type { Photo } from "@/lib/imagekit";
import Lightbox from "./Lightbox";

const PAGE_SIZE = 12;

export default function GalleryGrid({ photos: initialPhotos, isOwner = false }: { photos: Photo[]; isOwner?: boolean }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalPages = Math.ceil(photos.length / PAGE_SIZE);
  const paged = photos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function open(photo: Photo, index: number) {
    // index relative to full array for lightbox prev/next
    const globalIndex = (page - 1) * PAGE_SIZE + index;
    setSelected(photo);
    setSelectedIndex(globalIndex);
  }

  function prev() {
    const i = (selectedIndex - 1 + photos.length) % photos.length;
    setSelected(photos[i]);
    setSelectedIndex(i);
    // switch page if needed
    setPage(Math.floor(i / PAGE_SIZE) + 1);
  }

  function next() {
    const i = (selectedIndex + 1) % photos.length;
    setSelected(photos[i]);
    setSelectedIndex(i);
    setPage(Math.floor(i / PAGE_SIZE) + 1);
  }

  function onDeleted(key: string) {
    const updated = photos.filter(p => p.key !== key);
    setPhotos(updated);
    if (updated.length === 0) {
      setSelected(null);
    } else {
      const newIndex = Math.min(selectedIndex, updated.length - 1);
      setSelected(updated[newIndex]);
      setSelectedIndex(newIndex);
    }
  }

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Grid */}
      <div className="masonry w-full">
        {paged.map((photo, i) => (
          <div
            key={photo.key}
            className="masonry-item group relative cursor-zoom-in overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/5"
            onClick={() => open(photo, i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnailUrl}
              alt={photo.name}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <p className="text-white/80 text-xs truncate font-light tracking-wide">{photo.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 mb-4">
          {/* Prev */}
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-full text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {p}
            </button>
          ))}

          {/* Next */}
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
          hasPrev={photos.length > 1}
          hasNext={photos.length > 1}
          isOwner={isOwner}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}
