import ImageKit from "imagekit";

// Server-side ImageKit instance (private key only used here)
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export interface Photo {
  key: string;        // ImageKit fileId
  originalUrl: string;
  thumbnailUrl: string;
  name: string;
  uploadedAt: Date;
  size: number;
}

/** List all photos from ImageKit */
export async function listPhotos(): Promise<Photo[]> {
  const files = await imagekit.listFiles({
    path: "/gallery",
    fileType: "image",
    sort: "DESC_CREATED",
    limit: 500,
  });

  return (files as any[]).map((file) => ({
    key: file.fileId,
    // Original full-quality URL
    originalUrl: file.url,
    // Thumbnail: ImageKit transforms via URL params — 800px wide, auto quality
    thumbnailUrl: `${file.url}?tr=w-800,q-75,f-auto`,
    name: file.name,
    uploadedAt: new Date(file.createdAt),
    size: file.size ?? 0,
  }));
}

/** Return the original URL for download (ImageKit URLs are public) */
export async function getDownloadUrl(fileId: string, name: string): Promise<string> {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  // Force download via ImageKit transformation
  return `${endpoint}/gallery/${name}?tr=orig-true&ik-attachment=true`;
}
