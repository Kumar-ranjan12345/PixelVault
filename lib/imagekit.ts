import ImageKit from "imagekit";

export const CATEGORIES = ["All", "Travel", "Architecture", "Nature", "Street", "Food", "Wildlife", "Portrait", "Cityscape", "Sunset", "Beach", "Temple", "Festival", "Other"] as const;
export type Category = typeof CATEGORIES[number];

export interface Photo {
  key: string;
  originalUrl: string;
  thumbnailUrl: string;
  name: string;
  uploadedAt: Date;
  size: number;
  category?: string;
  location?: string;
}

function getImageKit() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });
}

export async function listPhotos(): Promise<Photo[]> {
  const ik = getImageKit();
  const files = await ik.listFiles({
    path: "/gallery",
    fileType: "image",
    sort: "DESC_CREATED",
    limit: 500,
  });

  return (files as any[]).map((file) => {
    const tags: string[] = file.tags ?? [];
    // First tag = category, second tag = location
    const category = tags[0] || "";
    const location = tags[1] || "";
    return {
      key: file.fileId,
      originalUrl: file.url,
      thumbnailUrl: `${file.url}&tr=f-auto,w-800,q-80`,
      name: file.name,
      uploadedAt: new Date(file.createdAt),
      size: file.size ?? 0,
      category,
      location,
    };
  });
}
