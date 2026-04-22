"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  ScrollText,
  Save,
  ArrowLeft,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  fetchLegalDocument,
  updateLegalDocument,
  type PolicyBlock,
} from "@/lib/api/legal";
import { PolicyBlockEditor } from "@/components/admin/PolicyBlockEditor";

interface LegalPageContentProps {
  type: "privacy_policy" | "terms_of_service";
}

export function LegalPageContent({ type }: LegalPageContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const title = type === "privacy_policy" ? "Privacy Policy" : "Terms of Service";
  const Icon = type === "privacy_policy" ? ShieldCheck : ScrollText;

  const {
    data: document,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["legal-document", type],
    queryFn: () => fetchLegalDocument(type),
  });

  const [blocks, setBlocks] = useState<PolicyBlock[]>([]);

  useEffect(() => {
    if (document) {
      setBlocks(document.blocks || []);
    }
  }, [document]);

  const updateMutation = useMutation({
    mutationFn: () => updateLegalDocument(type, blocks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["legal-document", type] });
      toast.success(`${title} Updated`, {
        description: "All changes have been successfully saved.",
      });
    },
    onError: (error) => {
      toast.error(`Failed to update ${title}`, {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const handleReset = () => {
    if (document) {
      setBlocks(document.blocks || []);
      toast.info("Changes Reset", {
        description: "The editor has been restored to the last saved version.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading {title}...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <ShieldCheck className="h-10 w-10 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold">Error loading document</h3>
          <p className="text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Manage and update site {title.toLowerCase()} documents
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 h-10 font-bold uppercase tracking-wider text-xs"
            onClick={handleReset}
            disabled={updateMutation.isPending}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button
            className="gap-2 h-10 px-6 font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-foreground/5">
          <div className="p-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
          <div className="p-6 sm:p-8">
            <div className="mb-8 border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-2">Content Structure</h2>
              <p className="text-sm text-muted-foreground">
                Build your document using translatable text blocks and checklists.
                You can nest blocks within each other to create complex hierarchies.
              </p>
            </div>

            <PolicyBlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 flex items-start gap-3">
          <div className="bg-green-500/10 p-2 rounded-lg text-green-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-sm text-green-700/80">
            <p className="font-bold uppercase tracking-wider text-[10px] mb-1">
              Legal Compliance Note
            </p>
            <p>
              Updating the {title.toLowerCase()} will immediately affect all users
              browsing the site. Ensure all translations (English, Kinyarwanda,
              French, Swahili) are accurate before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
