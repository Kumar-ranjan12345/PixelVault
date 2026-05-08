"use client";

import { useState, useRef } from "react";
import { CATEGORIES } from "@/lib/imagekit";

interface UploadResult {
  name: string;
  success?: boolean;
  error?: string;
}

export default function UploadClient({ secret }: { secret: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("Travel");
  const [customCategory, setCustomCategory] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(prev => {
        const existing = new Set(prev.map(f => f.name + f.size));
        const newFiles = Array.from(e.target.files!).filter(f => !existing.has(f.name + f.size));
        return [...prev, ...newFiles];
      });
      setResults([]);
      setApiError(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    setFiles(dropped);
    setResults([]);
    setApiError(null);
  }

  async function upload() {
    if (!files.length) return;
    setUploading(true);
    setResults([]);
    setApiError(null);

    const batchSize = 5;
    const allResults: UploadResult[] = [];

    try {
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const formData = new FormData();
        batch.forEach(f => formData.append("files", f));
        formData.append("category", category === "Other" && customCategory ? customCategory : category);
        formData.append("location", location);
        formData.append("title", title);

        const res = await fetch(`/api/upload?secret=${encodeURIComponent(secret)}`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          setApiError(`Server error ${res.status}: ${text}`);
          setUploading(false);
          return;
        }

        const data = await res.json();
        allResults.push(...(data.results ?? []));
      }
    } catch (err) {
      setApiError(`Network error: ${err}`);
      setUploading(false);
      return;
    }

    setResults(allResults);
    setFiles([]);
    setLocation("");
    setTitle("");
    setCustomCategory("");
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const successCount = results.filter(r => r.success).length;
  const failedResults = results.filter(r => r.error);

  return (
    <main className="min-h-screen bg-[#0c0c0c] flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Upload Photos</h1>
        <p className="text-zinc-500 text-sm mb-8">Originals stored at full quality · thumbnails auto-generated</p>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            dragOver ? "border-white bg-white/5" : "border-zinc-700 hover:border-zinc-500"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <svg className="w-10 h-10 mx-auto mb-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-zinc-400 text-sm">
            {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""} selected` : "Tap to select photos or drag here"}
          </p>
          <p className="text-zinc-600 text-xs mt-1">JPEG, PNG, WEBP, HEIC · max 50MB each</p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
        </div>

        {/* Previews */}
        {files.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-4 gap-2">
              {files.slice(0, 8).map((f, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-zinc-900 relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
                </div>
              ))}
              {files.length > 8 && (
                <div className="aspect-square rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 text-sm">+{files.length - 8}</div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <button onClick={() => inputRef.current?.click()} className="text-zinc-500 hover:text-white text-xs transition-colors">+ Add more</button>
              <button onClick={() => { setFiles([]); setResults([]); setApiError(null); }} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">Clear all</button>
            </div>
          </div>
        )}

        {/* Category */}
        <div className="mt-6">
          <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wide">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c !== "All").map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); }}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  category === c ? "bg-white text-black font-medium" : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {/* Custom category input when Other is selected */}
          {category === "Other" && (
            <input
              type="text"
              placeholder="Type your category..."
              onChange={e => setCustomCategory(e.target.value)}
              className="mt-3 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          )}
        </div>

        {/* Title */}
        <div className="mt-5">
          <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wide">Photo Title <span className="text-zinc-600 normal-case">(optional)</span></p>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Charminar at Dusk"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Location */}
        <div className="mt-5">
          <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wide">Location <span className="text-zinc-600 normal-case">(optional)</span></p>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Gokarna, India"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Upload button */}
        <button
          onClick={upload}
          disabled={!files.length || uploading}
          className="mt-6 w-full bg-white text-black font-semibold py-3 rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Uploading...</>
          ) : (
            `Upload ${files.length > 0 ? files.length + " " : ""}Photo${files.length !== 1 ? "s" : ""}`
          )}
        </button>

        {apiError && (
          <div className="mt-4 bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-xs font-mono break-all">{apiError}</div>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            {successCount > 0 && (
              <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3 text-green-400 text-sm">
                ✓ {successCount} photo{successCount > 1 ? "s" : ""} uploaded · {category}{location ? ` · ${location}` : ""}
              </div>
            )}
            {failedResults.map((r, i) => (
              <div key={i} className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-xs">✗ {r.name}: {r.error}</div>
            ))}
            {successCount > 0 && (
              <a href={`/manage/${secret}`} className="block text-center text-zinc-400 hover:text-white text-sm mt-4 transition-colors">View & manage gallery →</a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
