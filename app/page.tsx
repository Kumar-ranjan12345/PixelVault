import { listPhotos, type Photo } from "@/lib/imagekit";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 60; // refresh every 60s

// Demo photos shown when ImageKit is not configured
const DEMO_PHOTOS: Photo[] = Array.from({ length: 12 }, (_, i) => {
  const ids = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  const id = ids[i];
  return {
    key: `demo-${id}`,
    originalUrl: `https://picsum.photos/id/${id}/1200/900`,
    thumbnailUrl: `https://picsum.photos/id/${id}/600/450`,
    name: `demo-photo-${id}.jpg`,
    uploadedAt: new Date(Date.now() - i * 86400000),
    size: 3.2 * 1024 * 1024,
  };
});

export default async function GalleryPage() {
  let photos: Photo[] = [];
  let isDemo = false;

  try {
    photos = await listPhotos();
    if (photos.length === 0) {
      photos = DEMO_PHOTOS;
      isDemo = true;
    }
  } catch {
    photos = DEMO_PHOTOS;
    isDemo = true;
  }

  return (
    <main className="min-h-screen bg-[#0c0c0c]">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />

      {/* Header */}
      <div className="px-5 pt-10 pb-6 max-w-7xl mx-auto flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
            Gallery
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-zinc-500 text-sm">{photos.length} photos</p>
            {isDemo && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Demo mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 max-w-7xl border-t border-zinc-800/60 mb-6" />

      {/* Grid */}
      <div className="px-4 pb-20 max-w-7xl mx-auto">
        <GalleryGrid photos={photos} isDemo={isDemo} />
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-zinc-700 text-xs tracking-widest uppercase">
        {isDemo ? "Demo · Connect R2 to show your photos" : `${photos.length} photos`}
      </div>
    </main>
  );
}
