"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { forgotPasswordRequest } from "@/lib/api/auth";
import { isValidEmail } from "@/lib/auth-validation";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      setSent(true);
      toast.success(t(translations.auth.emailSent), {
        description: t(translations.auth.checkInbox),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    if (!email.trim()) {
      setFormError(t({ en: "Please enter your email address.", rw: "Andika emeyiri yawe.", fr: "Entrez votre adresse e-mail.", sw: "Ingiza barua pepe yako." }));
      return;
    }

    if (!isValidEmail(email)) {
      setFormError(t({ en: "Please provide a valid email address.", rw: "Andika emeyiri nyayo.", fr: "Veuillez fournir une adresse e-mail valide.", sw: "Tafadhali toa barua pepe halali." }));
      return;
    }

    forgotPasswordMutation.mutate({ email: email.trim().toLowerCase() });
  };

  const loading = forgotPasswordMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 md:py-20 max-w-md mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {t(translations.auth.forgotPasswordTitle)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {sent
                ? t(translations.auth.emailSent) // Or a dedicated "Reset link sent" 
                : t(translations.auth.enterEmailForLink)}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  {t(translations.checkoutPage.email)} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                  placeholder="john@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? t(translations.auth.sending) : t(translations.auth.sendResetLink)}
              </button>

              {formError && (
                <p className="text-sm text-destructive text-center">
                  {formError}
                </p>
              )}
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {t(translations.auth.didntReceiveEmail)}{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary font-semibold hover:underline"
                >
                  {t(translations.auth.tryAgain)}
                </button>
                .
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              <ArrowLeft className="h-3 w-3" /> {t(translations.auth.backToSignIn)}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
