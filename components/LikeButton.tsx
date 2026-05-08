"use client";

import { useEffect, useState } from "react";

interface Props {
  photoId: string;
  size?: "sm" | "md";
  showCount?: boolean;
}

export default function LikeButton({ photoId, size = "md", showCount = true }: Props) {
  const likedKey = `liked_${photoId}`;

  // Read localStorage synchronously on init
  const [liked, setLiked] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(likedKey) === "1";
  });
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/likes?id=${encodeURIComponent(photoId)}`)
      .then(r => r.json())
      .then(d => setCount(d.likes ?? 0))
      .catch(() => {});
  }, [photoId]);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation(); // prevent opening lightbox when clicking heart on grid
    if (loading) return;

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(c => newLiked ? c + 1 : Math.max(0, c - 1));
    if (newLiked) {
      localStorage.setItem(likedKey, "1");
    } else {
      localStorage.removeItem(likedKey);
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/likes?id=${encodeURIComponent(photoId)}`, {
        method: newLiked ? "POST" : "DELETE",
      });
      const data = await res.json();
      setCount(data.likes ?? 0);
    } catch {
      // Revert on error
      setLiked(!newLiked);
      setCount(c => newLiked ? Math.max(0, c - 1) : c + 1);
      if (!newLiked) localStorage.setItem(likedKey, "1");
      else localStorage.removeItem(likedKey);
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  if (size === "sm") {
    return (
      <button
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          liked
            ? "bg-red-500/30 text-red-400 border border-red-500/40"
            : "bg-black/50 text-white/70 hover:text-red-400 hover:bg-black/70 border border-white/10"
        }`}
        title={liked ? "Unlike" : "Like"}
      >
        <svg className={`${iconSize} transition-transform duration-150 ${liked ? "scale-110" : ""}`}
          fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        liked
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : "bg-zinc-800 text-zinc-300 hover:text-red-400 hover:bg-zinc-700 border border-zinc-700"
      }`}
      title={liked ? "Unlike" : "Like"}
    >
      <svg className={`${iconSize} transition-transform duration-150 ${liked ? "scale-110" : ""}`}
        fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {showCount && count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}
