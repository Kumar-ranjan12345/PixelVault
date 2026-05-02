import { notFound } from "next/navigation";
import UploadClient from "@/components/UploadClient";

interface Props {
  params: Promise<{ secret: string }>;
}

export default async function UploadPage({ params }: Props) {
  const { secret } = await params;

  if (secret !== process.env.UPLOAD_SECRET) {
    notFound();
  }

  return <UploadClient secret={secret} />;
}
