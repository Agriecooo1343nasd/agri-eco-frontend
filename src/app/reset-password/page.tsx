"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { resetPasswordRequest } from "@/lib/api/auth";
import { getPasswordHelpText, isStrongPassword } from "@/lib/auth-validation";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordRequest,
    onSuccess: () => {
      setSuccess(true);
      toast.success(t(translations.auth.passwordUpdated), {
        description: t(translations.auth.signWithNewPassword),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    if (!token) {
      setFormError(t(translations.auth.openLinkFromEmail));
      return;
    }

    if (!password || !confirmPassword) {
      setFormError(t(translations.checkoutPage.fillRequired));
      return;
    }
    if (password !== confirmPassword) {
      setFormError(t(translations.auth.passwordsMatch));
      return;
    }
    if (!isStrongPassword(password)) {
      setFormError(getPasswordHelpText());
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword: password,
      confirmPassword,
    });
  };

  const loading = resetPasswordMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 md:py-20 max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {success ? t(translations.auth.passwordUpdated) : t(translations.auth.resetPasswordTitle)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {success
                ? t(translations.auth.signWithNewPassword)
                : t(translations.auth.enterNewPassword)}
            </p>
            {!token && !success && (
              <p className="text-xs text-destructive mt-2">
                {t(translations.auth.tokenMissing)}
              </p>
            )}
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {t(translations.auth.newPassword)} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground pr-12"
                    placeholder={t(translations.auth.minCharacters)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {t(translations.auth.confirmNewPassword)} *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? t(translations.auth.updating) : t(translations.auth.resetPassword)}
              </button>

              {formError && (
                <p className="text-sm text-destructive text-center">
                  {formError}
                </p>
              )}
            </form>
          ) : (
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {t(translations.auth.backToSignIn)}
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
