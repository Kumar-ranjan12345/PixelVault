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

/** Build thumbnail URL with watermark using ImageKit SDK */
function buildThumbnailUrl(ik: ImageKit, filePath: string): string {
  return ik.url({
    path: filePath,
    transformation: [
      { width: "800", quality: "75", format: "auto" },
      {
        overlay: "text",
        overlayText: "© Kumar",
        overlayTextFontSize: "28",
        overlayTextColor: "FFFFFF",
        overlayBackground: "00000055",
        overlayX: "10",
        overlayY: "10",
        overlayTextEncoded: "false",
        overlayGravity: "south_east",
      },
    ],
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
    // Extract just the path after the endpoint
    const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
    const filePath = file.url.replace(endpoint, "");

    return {
      key: file.fileId,
      originalUrl: file.url,
      thumbnailUrl: buildThumbnailUrl(ik, filePath),
      name: file.name,
      uploadedAt: new Date(file.createdAt),
      size: file.size ?? 0,
    };
  });
}
