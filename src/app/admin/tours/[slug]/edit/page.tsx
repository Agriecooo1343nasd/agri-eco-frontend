"use client";

import { useParams, useRouter } from "next/navigation";
import { tours } from "@/data/tours";
import { TourForm } from "@/components/admin/TourForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditTourPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const tour = tours.find((t) => t.slug === slug);

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-bold">Tour not found</h2>
        <p className="text-muted-foreground text-sm">
          The experience you're looking for doesn't exist.
        </p>
        <Link href="/admin/tours">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return <TourForm mode="edit" initialData={tour} />;
}
