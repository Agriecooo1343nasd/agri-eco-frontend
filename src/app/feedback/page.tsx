"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageCircle, Send, Star, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitFeedback } from "@/lib/api/feedback";

import { translations } from "@/i18n/translations";
import { useLanguage } from "@/context/LanguageContext";

const feedbackTypes = [
  "General",
  "Bug Report",
  "Feature Request",
  "Compliment",
  "Complaint",
];

export default function Feedback() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    type: "General" as any,
    rating: 0,
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.rating === 0) {
      toast.error(t(translations.feedbackPage.ratingRequired));
      return;
    }

    setLoading(true);
    try {
      // Map UI types to backend enum values
      const typeMap: Record<string, string> = {
        "General": "general",
        "Bug Report": "bug_report",
        "Feature Request": "feature_request",
        "Compliment": "compliment",
        "Complaint": "complaint"
      };

      await submitFeedback({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        type: (typeMap[form.type] || "general") as any,
        rating: form.rating,
        subject: form.subject || `${t(translations.feedbackPage.badge)}: ${t(typeMap[form.type] || "general")}`,
        message: form.message,
      });
      
      setSubmitted(true);
      toast.success(t(translations.feedbackPage.successDesc));
    } catch (error: any) {
      console.error("Feedback submission failed:", error);
      toast.error(t({ en: "Submission Failed", rw: "Ntibyashobotse kohereza", fr: "Échec de l'envoi", sw: "Imeshindwa kutuma" }), {
        description: error.response?.data?.message || t({ en: "There was an error submitting your feedback. Please try again.", rw: "Habayeho ikibazo, ongera ugerageze.", fr: "Une erreur est survenue. Veuillez réessayer.", sw: "Hitilafu imetokea. Tafadhali jaribu tena." }),
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-2">
              {t(translations.feedbackPage.successTitle)}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(translations.feedbackPage.successDesc)}
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  fullName: "",
                  email: "",
                  phone: "",
                  type: "General" as any,
                  rating: 0,
                  subject: "",
                  message: "",
                });
              }}
              variant="outline"
            >
              {t(translations.feedbackPage.submitAnother)}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="bg-primary/5 border-b border-border">
        <div className="container py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="h-4 w-4" />
            {t(translations.feedbackPage.badge)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            {t(translations.feedbackPage.title)}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            {t(translations.feedbackPage.desc)}
          </p>
        </div>
      </section>

      <div className="container py-8 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t(translations.checkoutPage.fullName)} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t(translations.checkoutPage.email)} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t(translations.checkoutPage.phone)} ({t(translations.common.optional)})
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t(translations.feedbackPage.type)}</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackTypes.map((ft) => (
                        <SelectItem key={ft} value={ft}>
                          {t({
                            en: ft,
                            rw: ft === "General" ? "Rusange" : ft === "Bug Report" ? "Ibibazo" : ft === "Feature Request" ? "Icyifuzo" : ft === "Compliment" ? "Ishima" : "Ibibazo",
                            fr: ft,
                            sw: ft
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t(translations.feedbackPage.subject)} ({t(translations.common.optional)})</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t(translations.feedbackPage.subjectPlaceholder)}
                />
              </div>

              {/* Star rating */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t(translations.feedbackPage.ratingPrompt)}
                </Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7",
                          star <= form.rating
                            ? "fill-secondary text-secondary"
                            : "text-border",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t(translations.feedbackPage.message)} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder={t(translations.feedbackPage.messagePlaceholder)}
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? t(translations.tourDetailPage.submitting) : t(translations.feedbackPage.submitBtn)}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
