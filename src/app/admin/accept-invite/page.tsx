"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { acceptTeamInvite } from "@/lib/api/team";

/* ── password strength helpers ── */
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

/* ── Token-missing state ── */
function NoTokenState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-black font-heading text-foreground mb-2">
          Invalid Invitation Link
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          This link is missing the invitation token. Please use the exact link
          from your invitation email.
        </p>
        <Button asChild variant="outline">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    </div>
  );
}

/* ── Success state ── */
function SuccessState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black font-heading text-foreground mb-2">
          Account Activated!
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your Agri-Eco admin account is now active. Sign in to start
          collaborating with your team.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">
            Go to Login <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: acceptTeamInvite,
    onSuccess: () => {
      setSuccess(true);
      toast.success("Account activated!", {
        description: "Redirecting you to login…",
      });
      setTimeout(() => router.push("/login"), 2200);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "This invitation link is invalid or has already expired. Please contact your administrator.";
      setFormError(message);
      toast.error("Invitation Failed", { description: message });
    },
  });

  if (!token) return <NoTokenState />;
  if (success) return <SuccessState />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password || !confirmPassword) {
      setFormError("Please fill in both password fields.");
      return;
    }
    if (!isPasswordValid(password)) {
      setFormError("Your password doesn't meet the requirements listed below.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match. Please check and try again.");
      return;
    }

    acceptMutation.mutate({ token, password, confirmPassword });
  };

  const loading = acceptMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top brand strip */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="font-black font-heading text-foreground text-sm tracking-wide uppercase">
            Agri-Eco Admin
          </span>
        </div>
      </header>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="bg-primary px-8 py-8 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black font-heading leading-tight">
                You&apos;ve been invited!
              </h1>
              <p className="text-white/75 text-sm mt-1">
                Set a password to activate your Agri-Eco admin account.
              </p>
            </div>

            {/* Form body */}
            <div className="px-8 py-8 space-y-5">
              {/* Info note */}
              <div className="flex items-start gap-3 bg-muted/50 border border-border rounded-xl p-4">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your name and email were set by the administrator who invited
                  you. Simply choose a secure password to complete your account
                  setup.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Choose a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFormError(null);
                      }}
                      disabled={loading}
                      className="rounded-xl h-12 pr-11 font-medium transition-all focus:ring-primary/20"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

                {/* Password rules */}
                {password.length > 0 && (
                  <ul className="space-y-1.5 pl-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <li
                          key={rule.label}
                          className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                            passed ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                          )}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Confirm password */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFormError(null);
                      }}
                      disabled={loading}
                      className="rounded-xl h-12 pr-11 font-medium transition-all focus:ring-primary/20"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showConfirm
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Inline match indicator */}
                  {confirmPassword.length > 0 && (
                    <p
                      className={`text-xs font-medium pl-1 flex items-center gap-1.5 ${
                        password === confirmPassword
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Passwords match
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                          Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Form error */}
                {formError && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating Account…
                    </>
                  ) : (
                    <>
                      Activate My Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Card footer */}
            <div className="px-8 py-4 border-t border-border bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">
                Invitation expires 48 hours after it was sent.{" "}
                <Link
                  href="/contact"
                  className="text-primary hover:underline font-medium"
                >
                  Need help?
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
