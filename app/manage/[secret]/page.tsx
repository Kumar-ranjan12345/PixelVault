import { listPhotos } from "@/lib/imagekit";
import GalleryGrid from "@/components/GalleryGrid";
import Link from "next/link";

interface Props {
  params: Promise<{ secret: string }>;
}

export const revalidate = 0;

export default async function ManagePage({ params }: Props) {
  const { secret } = await params;
  const photos = await listPhotos().catch(() => []);

  return (
    <main className="min-h-screen bg-[#0c0c0c]">
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />

      <div className="px-4 pt-10 pb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
              Gallery
            </h1>
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
              Owner mode
            </span>
          </div>
          <p className="text-zinc-500 text-sm">{photos.length} photos · click a photo to delete</p>
        </div>
        <Link
          href={`/upload/${secret}`}
          className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-full transition-colors"
        >
          + Upload
        </Link>
      </div>

      <div className="mx-4 border-t border-zinc-800/60 mb-6" />

      <div className="px-3 pb-20">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-zinc-700">
            <p className="text-sm tracking-wide">No photos yet</p>
            <Link href={`/upload/${secret}`} className="mt-4 text-zinc-500 hover:text-white text-sm transition-colors">
              Upload your first photo →
            </Link>
          </div>
        ) : (
          <GalleryGrid photos={photos} isOwner={true} />
        )}
      </div>
    </main>
  );
}
