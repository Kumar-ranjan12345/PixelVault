"use client";

import { useEffect, useState } from "react";
import type { Photo } from "@/lib/imagekit";

interface Props {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isOwner?: boolean;
  onDeleted?: (key: string) => void;
}

export default function Lightbox({ photo, onClose, onPrev, onNext, hasPrev, hasNext, isOwner, onDeleted }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setConfirmDelete(false); onClose(); }
      if (e.key === "ArrowLeft" && !confirmDelete) onPrev();
      if (e.key === "ArrowRight" && !confirmDelete) onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, confirmDelete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    setConfirmDelete(false);
    setViews(null);
    // Track view + get count
    fetch(`/api/views?id=${encodeURIComponent(photo.key)}`, { method: "POST" })
      .then(r => r.json())
      .then(d => setViews(d.views))
      .catch(() => {});
  }, [photo.key]);

  async function handleShare() {
    const url = `${window.location.origin}?photo=${photo.key}`;
    if (navigator.share) {
      await navigator.share({ title: photo.title || photo.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  }

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

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: photo.key }),
      });
      onDeleted?.(photo.key);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const displayTitle = photo.title || photo.location || photo.name;

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 bg-black/96 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) { setConfirmDelete(false); onClose(); } }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex flex-col">
          <p className="text-white text-sm font-medium truncate max-w-xs">{displayTitle}</p>
          {photo.category && (
            <span className="text-zinc-500 text-xs tracking-widest uppercase mt-0.5">{photo.category}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Share */}
          <button onClick={handleShare}
            className="flex items-center gap-2 bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          {/* Download — owner only */}
          {isOwner && (
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50">
              {downloading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download
            </button>
          )}

          {/* Delete — owner only */}
          {isOwner && (
            <button onClick={handleDelete} disabled={deleting}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-50 ${
                confirmDelete ? "bg-red-600 text-white hover:bg-red-700" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}>
              {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {confirmDelete ? "Confirm delete" : "Delete"}
            </button>
          )}

          {confirmDelete && (
            <button onClick={() => setConfirmDelete(false)} className="text-zinc-500 hover:text-white text-sm px-3 py-2 transition-colors">Cancel</button>
          )}

          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center relative px-12 min-h-0">
        {hasPrev && (
          <button onClick={onPrev} className="absolute left-2 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.originalUrl} alt={displayTitle}
          className="max-h-full max-w-full object-contain rounded-lg"
          style={{ maxHeight: "calc(100vh - 120px)" }} />
        {hasNext && (
          <button onClick={onNext} className="absolute right-2 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="px-4 py-3 flex-shrink-0 text-center flex items-center justify-center gap-4">
        {photo.location && (
          <span className="text-zinc-500 text-xs">📍 {photo.location}</span>
        )}
        {views !== null && (
          <span className="text-zinc-600 text-xs">👁 {views} {views === 1 ? "view" : "views"}</span>
        )}
        <span className="text-zinc-700 text-xs">{(photo.size / (1024 * 1024)).toFixed(1)} MB</span>
      </div>
    </div>
  );
}


interface Props {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isOwner?: boolean;
  onDeleted?: (key: string) => void;
}

export default function Lightbox({ photo, onClose, onPrev, onNext, hasPrev, hasNext, isOwner, onDeleted }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setConfirmDelete(false); onClose(); }
      if (e.key === "ArrowLeft" && !confirmDelete) onPrev();
      if (e.key === "ArrowRight" && !confirmDelete) onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, confirmDelete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => { setConfirmDelete(false); }, [photo.key]);

  async function handleShare() {
    const url = `${window.location.origin}?photo=${photo.key}`;
    if (navigator.share) {
      await navigator.share({ title: photo.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  }

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

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: photo.key }),
      });
      onDeleted?.(photo.key);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) { setConfirmDelete(false); onClose(); } }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <p className="text-zinc-400 text-sm truncate max-w-xs">{photo.name}</p>
        <div className="flex items-center gap-2">

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          {/* Download — owner only */}
          {isOwner && (
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

          {/* Delete — owner only */}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors disabled:opacity-50 ${
                confirmDelete ? "bg-red-600 text-white hover:bg-red-700" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {deleting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              {confirmDelete ? "Confirm delete" : "Delete"}
            </button>
          )}

          {confirmDelete && (
            <button onClick={() => setConfirmDelete(false)} className="text-zinc-500 hover:text-white text-sm px-3 py-2 transition-colors">
              Cancel
            </button>
          )}

          {/* Close */}
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center relative px-12 min-h-0">
        {hasPrev && (
          <button onClick={onPrev} className="absolute left-2 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.originalUrl}
          alt={photo.name}
          className="max-h-full max-w-full object-contain rounded-lg"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        />
        {hasNext && (
          <button onClick={onNext} className="absolute right-2 text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-4 py-3 flex-shrink-0 text-center">
        <p className="text-zinc-600 text-xs">
          {photo.location && <span className="text-zinc-500 mr-2">📍 {photo.location}</span>}
          {(photo.size / (1024 * 1024)).toFixed(1)} MB · {new Date(photo.uploadedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
