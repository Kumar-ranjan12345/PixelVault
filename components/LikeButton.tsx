"use client";

import { useEffect, useState } from "react";

interface Props {
  photoId: string;
  size?: "sm" | "md";
  showCount?: boolean;
}

export default function LikeButton({ photoId, size = "md", showCount = true }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load initial count + check if already liked (localStorage)
  useEffect(() => {
    const likedKey = `liked_${photoId}`;
    setLiked(localStorage.getItem(likedKey) === "1");

    fetch(`/api/likes?id=${encodeURIComponent(photoId)}`)
      .then(r => r.json())
      .then(d => setCount(d.likes ?? 0))
      .catch(() => {});
  }, [photoId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const likedKey = `liked_${photoId}`;
    const isLiked = localStorage.getItem(likedKey) === "1";

    try {
      const res = await fetch(`/api/likes?id=${encodeURIComponent(photoId)}`, {
        method: isLiked ? "DELETE" : "POST",
      });
      const data = await res.json();
      setCount(data.likes ?? 0);
      if (isLiked) {
        localStorage.removeItem(likedKey);
        setLiked(false);
      } else {
        localStorage.setItem(likedKey, "1");
        setLiked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const btnSize = size === "sm"
    ? "w-8 h-8 rounded-full"
    : "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${btnSize} transition-all duration-200 flex items-center justify-center gap-1.5 ${
        liked
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : size === "sm"
            ? "bg-black/40 text-white/70 hover:text-red-400 hover:bg-black/60 border border-white/10"
            : "bg-zinc-800 text-zinc-300 hover:text-red-400 hover:bg-zinc-700 border border-zinc-700"
      }`}
      title={liked ? "Unlike" : "Like"}
    >
      <svg
        className={`${iconSize} transition-transform duration-200 ${liked ? "scale-110" : ""}`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {showCount && count > 0 && (
        <span className="text-xs">{count}</span>
      )}
    </button>
  );
}
