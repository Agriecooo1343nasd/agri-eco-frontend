"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  KeyRound,
  Loader2,
  Home,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { acceptTeamInvite } from "@/lib/api/team";

interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a–z)", test: (v) => /[a-z]/.test(v) },
  { label: "One number (0–9)", test: (v) => /\d/.test(v) },
];

function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}

function NoTokenState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 md:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-black font-heading text-foreground mb-2">
          Invalid invitation link
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          This link is missing the invitation token. Open the full URL from
          your invitation email, or ask an administrator to resend the invite.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 md:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black font-heading text-foreground mb-2">
          You&apos;re all set
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Your team account is active. Sign in with your email and the password
          you just created to open the admin workspace.
        </p>
        <Button asChild className="w-full h-11">
          <Link href="/login">
            Go to sign in <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }

    const validate = async () => {
      try {
        const data = await import("@/lib/api/team").then((m) =>
          m.validateInviteToken(token),
        );
        setInviteData(data);
      } catch (err: any) {
        setFormError(
          err.response?.data?.message || "This invitation link is invalid or has expired."
        );
      } finally {
        setIsValidating(false);
      }
    };
    validate();
  }, [token]);

  const acceptMutation = useMutation({
    mutationFn: acceptTeamInvite,
    onSuccess: () => {
      setSuccess(true);
      toast.success("Account activated", {
        description: "You can sign in now.",
      });
      setTimeout(() => router.push("/login"), 2200);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "This invitation is invalid or has expired. Ask your administrator for a new link.";
      setFormError(message);
    },
  });

  if (!token) return <NoTokenState />;
  if (isValidating) return <AcceptInviteFallback />;
  if (success) return <SuccessState />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Only validate password if user doesn't exist
    if (!inviteData?.userExists) {
      if (!password || !confirmPassword) {
        setFormError("Please fill in both password fields.");
        return;
      }
      if (!isPasswordValid(password)) {
        setFormError(
          "Your password doesn't meet the requirements listed below.",
        );
        return;
      }
      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
    }

    acceptMutation.mutate({
      token,
      ...(inviteData?.userExists ? {} : { password, confirmPassword }),
    });
  };

  const loading = acceptMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/assets/logo/logo.png"
              alt="Agri-Eco Iter"
              width={180}
              height={56}
              className="h-10 w-auto max-w-[min(200px,55vw)] object-contain object-left"
              priority
            />
          </Link>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10 md:py-14">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-primary px-6 sm:px-8 py-8 text-primary-foreground">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading leading-tight">
                Team invitation
              </h1>
              <p className="text-primary-foreground/85 text-sm mt-2 leading-relaxed">
                Set a password to activate your account. If you already have an
                existing account, your old password will remain unchanged—simply
                login securely afterwards.
              </p>
            </div>

            <div className="px-6 sm:px-8 py-8 space-y-5">
              <div className="flex items-start gap-3 bg-muted/50 border border-border rounded-xl p-4">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    {inviteData?.userExists
                      ? "Account already exists"
                      : "New team account"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {inviteData?.userExists
                      ? "We found your existing account. Just click activate to accept this new team role."
                      : "Create a password to activate your new team workspace."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!inviteData?.userExists ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-0.5">
                        New password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setFormError(null);
                          }}
                          disabled={loading}
                          className="rounded-xl h-12 pr-11"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {password.length > 0 && (
                      <ul className="space-y-1.5 pl-0.5">
                        {PASSWORD_RULES.map((rule) => {
                          const passed = rule.test(password);
                          return (
                            <li
                              key={rule.label}
                              className={`flex items-center gap-2 text-xs font-medium ${
                                passed ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {passed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 shrink-0 opacity-50" />
                              )}
                              {rule.label}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-0.5">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setFormError(null);
                          }}
                          disabled={loading}
                          className="rounded-xl h-12 pr-11"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showConfirm ? "Hide confirm password" : "Show confirm"
                          }
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && (
                        <p
                          className={`text-xs font-medium flex items-center gap-1.5 ${
                            password === confirmPassword
                              ? "text-primary"
                              : "text-destructive"
                          }`}
                        >
                          {password === confirmPassword ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Passwords
                              match
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" /> Passwords do
                              not match
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <p className="text-sm text-center text-muted-foreground">
                      Welcome back,{" "}
                      <span className="font-bold text-foreground">
                        {inviteData.email}
                      </span>
                      !
                    </p>
                  </div>
                )}

                {formError && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating…
                    </>
                  ) : (
                    <>
                      Activate account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-border bg-muted/20 text-center">
              <p className="text-xs text-muted-foreground">
                Invites expire 48 hours after they&apos;re sent.{" "}
                <Link
                  href="/contact"
                  className="text-primary font-medium hover:underline"
                >
                  Contact support
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Wrong place?{" "}
            <Link href="/" className="text-primary font-medium hover:underline">
              Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function AcceptInviteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteFallback />}>
      <AcceptInviteForm />
    </Suspense>
  );
}
