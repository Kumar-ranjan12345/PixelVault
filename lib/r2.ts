import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET = process.env.R2_BUCKET_NAME!;
export const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export interface Photo {
  key: string;
  originalUrl: string;
  thumbnailUrl: string;
  name: string;
  uploadedAt: Date;
  size: number;
}

/** List all photos from R2, pairing originals with their thumbnails */
export async function listPhotos(): Promise<Photo[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: "originals/",
  });

  const response = await r2.send(command);
  const objects = response.Contents ?? [];

  return objects
    .filter((obj) => obj.Key && obj.Key !== "originals/")
    .map((obj) => {
      const key = obj.Key!;
      const filename = key.replace("originals/", "");
      const thumbnailKey = `thumbnails/${filename}`;

      return {
        key,
        originalUrl: `${PUBLIC_URL}/${key}`,
        thumbnailUrl: `${PUBLIC_URL}/${thumbnailKey}`,
        name: filename,
        uploadedAt: obj.LastModified ?? new Date(),
        size: obj.Size ?? 0,
      };
    })
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

/** Generate a signed download URL for the original (expires in 1 hour) */
export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${key.replace("originals/", "")}"`,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}
