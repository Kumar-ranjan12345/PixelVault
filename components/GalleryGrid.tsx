"use client";

import { useState } from "react";
import type { Photo } from "@/lib/imagekit";
import Lightbox from "./Lightbox";

export default function GalleryGrid({ photos: initialPhotos, isOwner = false }: { photos: Photo[]; isOwner?: boolean }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  function open(photo: Photo, index: number) {
    setSelected(photo);
    setSelectedIndex(index);
  }

  function prev() {
    const i = (selectedIndex - 1 + photos.length) % photos.length;
    setSelected(photos[i]);
    setSelectedIndex(i);
  }

  function next() {
    const i = (selectedIndex + 1) % photos.length;
    setSelected(photos[i]);
    setSelectedIndex(i);
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

  return (
    <>
      <div className="masonry w-full">
        {photos.map((photo, i) => (
          <div
            key={photo.key}
            className="masonry-item group relative cursor-zoom-in overflow-hidden rounded-md bg-zinc-900 ring-1 ring-white/5"
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
