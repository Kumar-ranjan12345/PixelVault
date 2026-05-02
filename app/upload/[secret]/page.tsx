import UploadClient from "@/components/UploadClient";

interface Props {
  params: Promise<{ secret: string }>;
}

export default async function UploadPage({ params }: Props) {
  const { secret } = await params;
  return <UploadClient secret={secret} />;
}
