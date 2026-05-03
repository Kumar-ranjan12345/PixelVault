import ImageKit from "imagekit";

export interface Photo {
  key: string;
  originalUrl: string;
  thumbnailUrl: string;
  name: string;
  uploadedAt: Date;
  size: number;
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

  return (files as any[]).map((file) => ({
    key: file.fileId,
    originalUrl: file.url,
    thumbnailUrl: file.url,
    name: file.name,
    uploadedAt: new Date(file.createdAt),
    size: file.size ?? 0,
  }));
}
