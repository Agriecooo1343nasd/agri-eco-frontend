import { redirect } from "next/navigation";

export default async function ArtisanRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/community/artisan/${id}`);
}
