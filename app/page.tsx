import { listPhotos } from "@/lib/imagekit";
import GalleryGrid from "@/components/GalleryGrid";
import StickyNav from "@/components/StickyNav";

export const revalidate = 0;

export default async function GalleryPage() {
  const photos = await listPhotos().catch(() => []);

  return (
    <main className="min-h-screen bg-[#0d0b09]">
      {/* Sticky nav — glass effect */}
      <StickyNav photoCount={photos.length} />

      {/* Centered Gallery heading */}
      <div className="text-center pt-10 pb-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
          Gallery
        </h1>
      </div>

      <div className="px-4 sm:px-10 pb-20 mt-2">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-zinc-700">
            <svg className="w-12 h-12 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm tracking-wide">No photos yet</p>
          </div>
        ) : (
          <GalleryGrid photos={photos} isOwner={false} />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 mt-4 px-6 py-10">
        <div className="flex flex-col items-center gap-2">
          <span className="font-script text-3xl text-zinc-300">Kumar Ranjan Kamila</span>
          <span className="text-zinc-700 text-xs tracking-widest uppercase">{photos.length} photos · © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
