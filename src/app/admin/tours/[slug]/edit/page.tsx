"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TourForm } from "@/components/admin/TourForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchAdminExperienceById } from "@/lib/api/experiences";

export default function EditTourPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const id = searchParams.get("id");

  const experienceQuery = useQuery({
    queryKey: ["admin-experience", id],
    queryFn: () => fetchAdminExperienceById(id!),
    enabled: Boolean(id),
    retry: 1,
  });

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-bold">Missing Experience ID</h2>
        <p className="text-muted-foreground text-sm">
          Navigate to this page from the Experience Catalog — the ID is required
          to load the experience.
        </p>
        <Link href="/admin/tours">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  if (experienceQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading experience{slug ? ` "${slug}"` : ""}…
        </p>
      </div>
    );
  }

  if (experienceQuery.isError || !experienceQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-bold">Experience Not Found</h2>
        <p className="text-muted-foreground text-sm">
          {experienceQuery.error instanceof Error
            ? experienceQuery.error.message
            : "Could not load this experience. It may have been deleted."}
        </p>
        <Link href="/admin/tours">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return <TourForm mode="edit" initialData={experienceQuery.data} />;
}
