"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerRequest } from "@/lib/api/auth";
import {
  getPasswordHelpText,
  isStrongPassword,
  isValidEmail,
  isValidPhone,
} from "@/lib/auth-validation";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const RegisterPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      toast.success(t({ en: "Account created!", rw: "Konti yafunguwe!", fr: "Compte créé !", sw: "Akaunti imefunguliwa!" }), {
        description: t({ en: "Your account is ready. Please sign in with your email and password.", rw: "Konti yawe yiteguye. Koresha emeyiri n'ijambo ry'ibanga wunjire.", fr: "Votre compte est prêt. Veuillez vous connecter.", sw: "Akaunti yako iko tayari. Tafadhali ingia na barua pepe na nywila yako." }),
      });
      router.push("/login");
    },
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setFormError(t(translations.checkoutPage.fillRequired));
      return;
    }

    if (!isValidEmail(form.email)) {
      setFormError(t({ en: "Please provide a valid email address.", rw: "Andika emeyiri nyayo.", fr: "Veuillez fournir une adresse e-mail valide.", sw: "Tafadhali toa barua pepe halali." }));
      return;
    }

    if (!isValidPhone(form.phone)) {
      setFormError(
        t({ en: "Use a valid phone format (digits, spaces, +, -, or parentheses).", rw: "Andika numero ya telefoni nyayo.", fr: "Utilisez un format de téléphone valide.", sw: "Tumia muundo halali wa simu." }),
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError(t({ en: "Please make sure your passwords match.", rw: "Andika amagambo y'ibanga asa.", fr: "Veuillez vous assurer que les mots de passe correspondent.", sw: "Tafadhali hakikisha nywila zako zinalandana." }));
      return;
    }

    if (!isStrongPassword(form.password)) {
      setFormError(getPasswordHelpText());
      return;
    }

    if (!agreed) {
      setFormError(t({ en: "Please agree to the terms and conditions.", rw: "Emeranya n'amategeko n'amabwiriza.", fr: "Veuillez accepter les conditions d'utilisation.", sw: "Tafadhali kubali sheria na masharti." }));
      return;
    }

    registerMutation.mutate({
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
  };

  const loading = registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 md:py-20 max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/10">
              <img
                src="/assets/logo/logo.png"
                alt="Agri-Eco Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {t(translations.auth.createAccount)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(translations.auth.joinAgriEco)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t(translations.auth.username)} *
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleInput}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder="johndoe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t(translations.checkoutPage.email)} *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleInput}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t(translations.checkoutPage.phone)}{" "}
                <span className="text-muted-foreground font-normal">
                  ({t(translations.common.optional)})
                </span>
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleInput}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder="+250 7XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t(translations.auth.password)} *
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleInput}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground pr-12"
                  placeholder={t({ en: "Min 8 characters", rw: "Byibuze inyuguti 8", fr: "Min 8 caractères", sw: "Angalau vibambo 8" })}
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
                {t(translations.auth.confirmPassword)} *
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleInput}
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
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t(translations.auth.location)}{" "}
                <span className="text-muted-foreground font-normal">
                  ({t(translations.common.optional)})
                </span>
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleInput}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder="Kigali, Rwanda"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="rounded border-border text-primary focus:ring-primary/30 mt-0.5"
              />
              <span>
                {t(translations.auth.agreeTo)}{" "}
                <span className="text-primary font-bold">{t(translations.auth.terms)}</span>{" "}
                {t(translations.auth.and)}{" "}
                <span className="text-primary font-bold">{t(translations.auth.privacy)}</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                t(translations.auth.creatingAccount)
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> {t(translations.auth.createAccount)}
                </>
              )}
            </button>

            {formError && (
              <p className="text-sm text-destructive text-center">
                {formError}
              </p>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t(translations.auth.alreadyHaveAccount)}{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              {t(translations.auth.signIn)}
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
