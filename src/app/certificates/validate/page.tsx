"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle2, Loader2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  validateCertificateNumber,
  type CertificateValidationResult,
} from "@/lib/api/education";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ValidateCertificateInner() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code")?.trim() ?? "";

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateValidationResult | null>(
    null,
  );
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  async function runValidation(value: string) {
    const v = value.trim();
    if (!v) {
      setResult({ valid: false, message: "Enter a certificate number" });
      setSearched(true);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await validateCertificateNumber(v);
      setResult(data);
    } catch {
      setResult({ valid: false, message: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode) {
      void runValidation(initialCode);
    }
  }, [initialCode]);

  function programTitleLabel(
    title: string | Record<string, string> | undefined,
  ): string {
    if (!title) return "—";
    if (typeof title === "string") return title;
    return title.en || (Object.values(title)[0] as string) || "—";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container max-w-lg py-12 md:py-16 flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-xl">
              <Award className="h-5 w-5 text-primary" />
              Verify certificate
            </CardTitle>
            <CardDescription>
              Enter the certificate ID from the PDF or scan the QR code on the
              certificate (it opens this page with the code filled in).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cert-code">Certificate number</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="cert-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CERT-ABC12345"
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  className="shrink-0"
                  disabled={loading}
                  onClick={() => void runValidation(code)}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>
            </div>

            {loading && searched ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </div>
            ) : null}

            {!loading && searched && result ? (
              <div
                className={`rounded-xl border p-4 flex gap-3 ${
                  result.valid
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                {result.valid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 space-y-1 text-sm">
                  {result.valid ? (
                    <>
                      <p className="font-semibold text-foreground">
                        Valid certificate
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Program:{" "}
                        </span>
                        {programTitleLabel(result.programTitle)}
                      </p>
                      {result.participantName ? (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Recipient:{" "}
                          </span>
                          {result.participantName}
                        </p>
                      ) : null}
                      {result.issuedAt ? (
                        <p className="text-muted-foreground text-xs">
                          Issued:{" "}
                          {new Date(result.issuedAt).toLocaleDateString()}
                        </p>
                      ) : null}
                      {result.certificateNumber ? (
                        <p className="font-mono text-xs text-muted-foreground break-all">
                          ID: {result.certificateNumber}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-destructive font-medium">
                      {result.message ||
                        "No matching certificate was found for this number."}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            <Button variant="outline" asChild className="w-full">
              <Link href="/education">Browse training programs</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function ValidateCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ValidateCertificateInner />
    </Suspense>
  );
}
