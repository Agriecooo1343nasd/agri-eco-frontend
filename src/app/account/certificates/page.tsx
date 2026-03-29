"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Download,
  ExternalLink,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchMyEnrollments,
  type TrainingEnrollment,
} from "@/lib/api/education";
import {
  templateFromProgramField,
  exportCertificateToPng,
} from "@/lib/certificate-template";
import { TrainingCertificateVisual } from "@/components/certificate/TrainingCertificateVisual";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function hasIssuedCertificate(e: TrainingEnrollment): boolean {
  return Boolean(e.certificateNumber?.trim() || e.certificateUrl);
}

function formatIssueDate(e: TrainingEnrollment): string {
  if (e.certificateIssuedAt) {
    return new Date(e.certificateIssuedAt).toLocaleDateString();
  }
  return new Date(e.updatedAt).toLocaleDateString();
}

function certificateIdFor(e: TrainingEnrollment): string {
  return (e.certificateNumber?.trim() || e.id).trim();
}

export default function CertificatesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const exportDialogRef = useRef<HTMLDivElement>(null);
  const exportCaptureRef = useRef<HTMLDivElement>(null);
  const [viewing, setViewing] = useState<TrainingEnrollment | null>(null);
  const [capturing, setCapturing] = useState<TrainingEnrollment | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const enrollmentsQuery = useQuery({
    queryKey: ["myEnrollments", "certificates"],
    queryFn: () =>
      fetchMyEnrollments({
        limit: 100,
        page: 1,
        sort: "createdAt",
        order: "desc",
      }),
  });

  const issuedList = useMemo(() => {
    const rows = enrollmentsQuery.data?.data ?? [];
    return rows.filter(
      (e) => e.status === "completed" && hasIssuedCertificate(e),
    );
  }, [enrollmentsQuery.data?.data]);

  async function runPngExport(
    enrollment: TrainingEnrollment,
    mode: "dialog" | "capture",
  ) {
    const node =
      mode === "dialog" ? exportDialogRef.current : exportCaptureRef.current;
    if (!node) {
      toast.error(
        t({ en: "Could not capture certificate", rw: "Ntibyakunze" }),
      );
      return;
    }
    try {
      const dataUrl = await exportCertificateToPng(node);
      const a = document.createElement("a");
      a.href = dataUrl;
      const id = certificateIdFor(enrollment);
      const slug = enrollment.trainingProgram?.slug ?? "program";
      a.download = `certificate-${id}-${slug}.png`;
      a.click();
      toast.success(
        t({ en: "Certificate downloaded", rw: "Impamyabumenyi yakuritswe" }),
      );
    } catch (err) {
      toast.error(t({ en: "Download failed", rw: "Ntibyakunze" }), {
        description: String(err),
      });
    }
  }

  async function handleDownloadFromList(enrollment: TrainingEnrollment) {
    setViewing(null);
    setCapturing(enrollment);
    setDownloadingId(enrollment.id);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await runPngExport(enrollment, "capture");
    setCapturing(null);
    setDownloadingId(null);
  }

  async function handleDownloadFromDialog() {
    if (!viewing) return;
    setDownloadingId(viewing.id);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await runPngExport(viewing, "dialog");
    setDownloadingId(null);
  }

  function visualProps(enrollment: TrainingEnrollment) {
    return {
      template: templateFromProgramField(
        enrollment.trainingProgram?.certificateTemplate,
      ),
      recipientName: enrollment.fullName || user?.name || "Participant",
      issueDate: formatIssueDate(enrollment),
      certificateId: certificateIdFor(enrollment),
      t,
    };
  }

  if (enrollmentsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">
          {t({ en: "Loading your certificates…", rw: "Gutangira…" })}
        </p>
      </div>
    );
  }

  if (enrollmentsQuery.isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {t({
            en: "Could not load certificates. Please try again.",
            rw: "Ntibyakunze. Ongera ugerageze.",
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        {t({ en: "My Certificates", rw: "Impamyabumenyi zanjye" })}
      </h2>

      {issuedList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">
              {t({
                en: "No issued certificates yet. Complete a program to earn one.",
                rw: "Nta mpamyabumenyi. Fata amahugurwa uce agasozwa.",
              })}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/education">
                {t({ en: "Browse programs", rw: "Reba amahugurwa" })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {issuedList.map((enrollment) => {
            const program = enrollment.trainingProgram;
            const title =
              typeof program?.title === "object" && program?.title
                ? t(program.title)
                : program?.slug ?? "Program";
            const slug = program?.slug;

            return (
              <Card
                key={enrollment.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 p-5 text-center border-b border-border relative">
                    <Award className="h-10 w-10 text-primary mx-auto mb-2" />
                    <h3 className="font-bold font-heading text-foreground text-sm line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate px-2">
                      {enrollment.certificateNumber ?? enrollment.id}
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="min-w-0 truncate">
                        {t({ en: "Recipient", rw: "Uwatanze" })}:{" "}
                        <span className="text-foreground font-medium">
                          {enrollment.fullName || user?.name || "—"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3" />
                        {formatIssueDate(enrollment)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs gap-1"
                        onClick={() => setViewing(enrollment)}
                      >
                        <Award className="h-3 w-3" />
                        {t({ en: "View", rw: "Reba" })}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 h-9 text-xs gap-1"
                        disabled={downloadingId === enrollment.id}
                        onClick={() => void handleDownloadFromList(enrollment)}
                      >
                        {downloadingId === enrollment.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        {t({ en: "Download PNG", rw: "Kuraho PNG" })}
                      </Button>
                      {slug ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs gap-1 px-2 shrink-0"
                          asChild
                        >
                          <Link href={`/education/program/${slug}`}>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {t({ en: "Your Certificate", rw: "Impamyabumenyi Yawe" })}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t({
                en: "Save a copy as PNG. The QR code contains your certificate ID.",
                rw: "Kuraho kopi. QR irimo indanganyanga.",
              })}
            </DialogDescription>
          </DialogHeader>
          {viewing ? (
            <>
              <TrainingCertificateVisual
                ref={exportDialogRef}
                {...visualProps(viewing)}
              />
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  className="gap-2 text-xs h-10"
                  disabled={downloadingId !== null}
                  onClick={() => void handleDownloadFromDialog()}
                >
                  {downloadingId === viewing.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {t({ en: "Download PNG", rw: "Kuraho PNG" })}
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {capturing ? (
        <div
          className="pointer-events-none fixed -left-[200vw] top-0 w-[min(640px,100vw)] opacity-0"
          aria-hidden
        >
          <TrainingCertificateVisual
            ref={exportCaptureRef}
            {...visualProps(capturing)}
          />
        </div>
      ) : null}
    </div>
  );
}
