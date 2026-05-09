"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useEffect } from "react";
import {
  CheckCircle2,
  ArrowLeft,
  Building2,
  Image as ImageIcon,
  Loader2,
  Globe,
  Twitter,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  Info,
  ExternalLink,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { submitPartnerApplication } from "@/lib/api/partners";
import { fetchMyRoleStatus } from "@/lib/api/user";
import { uploadSingleImage } from "@/lib/api/uploads";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import Image from "next/image";
import Link from "next/link";

export default function PartnerApplyPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    contactPerson: user?.name || "",
    email: user?.email || "",
    phone: "",
    type: "tourism_operator",
    aboutBusiness: "",
    publicDescription: "",
    location: "",
    website: "",
    twitter: "",
    linkedin: "",
    image: "",
    links: [] as string[],
  });

  const { data: roleStatus, isLoading: isLoadingRoleStatus } = useQuery({
    queryKey: ["user-role-status-partner-apply"],
    queryFn: fetchMyRoleStatus,
  });

  const existing = roleStatus?.partner?.latestApplication;

  useEffect(() => {
    if (existing) {
      setForm({
        businessName: (existing as any).businessName || "",
        contactPerson: (existing as any).contactName || user?.name || "",
        email: (existing as any).email || user?.email || "",
        phone: (existing as any).phone || "",
        type: (existing as any).businessType || "tourism_operator",
        aboutBusiness: (existing as any).description || "",
        publicDescription: (existing as any).publicDescription || "",
        location: (existing as any).location || "",
        website: (existing as any).website || "",
        twitter: (existing as any).twitterUrl || "",
        linkedin: (existing as any).linkedinUrl || "",
        image: (existing as any).image || "",
        links: (existing as any).links || [],
      });
      if (existing.status !== "none") setAgreed(true);
    }
    setIsLoading(isLoadingRoleStatus);
  }, [existing, isLoadingRoleStatus, user]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadSingleImage(file),
    onSuccess: (data) => {
      setForm((prev) => ({ ...prev, image: data.path }));
      toast.success("Image uploaded successfully");
    },
    onError: () => toast.error("Failed to upload image"),
    onSettled: () => setIsUploading(false),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const submitApplicationMutation = useMutation({
    mutationFn: submitPartnerApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-role-status-partner"] });
      queryClient.invalidateQueries({ queryKey: ["user-role-status-partner-apply"] });
      queryClient.invalidateQueries({ queryKey: ["user-role-status-header"] });
      toast.success(t(translations.common.success), {
        description: t(translations.partnerPage.underReview),
      });
      router.push("/account/partner");
    },
    onError: (error: Error) => {
      toast.error("Failed to submit application", {
        description: error.message || "Please try again.",
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (existing?.status === "pending") {
      toast.info("Your application is already pending review.");
      return;
    }
    if (!agreed) {
      toast.error("Terms & Conditions", {
        description: "You must agree to the terms and conditions before submitting.",
      });
      return;
    }
    if (!form.businessName || !form.contactPerson || !form.email || !form.phone) {
      toast.error(t(translations.common.errorLoading), {
        description: t(translations.auth.required),
      });
      return;
    }
    submitApplicationMutation.mutate({
      businessName: form.businessName.trim(),
      businessType: form.type,
      contactName: form.contactPerson.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      description: form.aboutBusiness.trim() || undefined,
      publicDescription: form.publicDescription.trim() || undefined,
      location: form.location.trim(),
      website: form.website.trim(),
      twitterUrl: form.twitter.trim(),
      linkedinUrl: form.linkedin.trim(),
      image: form.image,
      links: form.links,
    });
  };

  const addLink = () => setForm((prev) => ({ ...prev, links: [...prev.links, ""] }));
  const updateLink = (index: number, value: string) => {
    const newLinks = [...form.links];
    newLinks[index] = value;
    setForm((prev) => ({ ...prev, links: newLinks }));
  };
  const removeLink = (index: number) =>
    setForm((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking application status...</p>
      </div>
    );
  }

  const status = existing?.status || "none";
  const isLocked = status !== "none";

  return (
    <div className="space-y-6 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <Link
            href="/account/partner"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to partner portal
          </Link>
          <h1 className="text-3xl font-black text-foreground font-heading">
            {t(translations.partnerPage.applyTitle)}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            {t(translations.partnerPage.applyDescription)}
          </p>
        </div>
        {status === "pending" && (
          <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Your application is currently pending review
          </div>
        )}
        {status === "approved" && (
          <div className="rounded-md border border-green-500/20 bg-green-50 px-4 py-3 text-sm flex items-center gap-2 font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Your application has been approved!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Details */}
        <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.businessName)} *
                </Label>
                <Input
                  placeholder="Example: Green Valley Tours Ltd"
                  value={form.businessName}
                  onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))}
                  required
                  disabled={isLocked}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.businessType)} *
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                  disabled={isLocked}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism_operator">Tourism Operator</SelectItem>
                    <SelectItem value="hotel">Hotel / Lodge</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="school">School / Institution</SelectItem>
                    <SelectItem value="ngo">NGO / Non-profit</SelectItem>
                    <SelectItem value="business">General Business</SelectItem>
                    <SelectItem value="logistics">Logistics & Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.location)} *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="City, District (e.g. Musanze, Rwanda)"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    required
                    disabled={isLocked}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.website)}
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                    disabled={isLocked}
                  />
                </div>
              </div>

              {/* Logo upload — spans full width on mobile, half on md */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.partnerImage)}
                </Label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-muted/20">
                  <div className="relative w-24 h-24 rounded-xl border border-border flex items-center justify-center overflow-hidden bg-background shrink-0">
                    {form.image ? (
                      <Image src={form.image} alt="Partner Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Upload your business logo or a representative image. This helps users recognise your brand.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="relative cursor-pointer rounded-xl"
                      disabled={isUploading || isLocked}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploading || isLocked}
                      />
                      {form.image ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descriptions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Public Showcase
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Public Description *
              </Label>
              <Textarea
                className="resize-none"
                rows={4}
                placeholder="Describe your services, audience, and what makes your business unique. Visible to the public."
                value={form.publicDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, publicDescription: e.target.value }))}
                required
                disabled={isLocked}
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3 w-3" /> Visible to customers and artisans.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Partnership Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Internal Message
              </Label>
              <Textarea
                className="resize-none"
                rows={4}
                placeholder="How do you want to partner with Agri-Eco? Share your specific goals and expectations."
                value={form.aboutBusiness}
                onChange={(e) => setForm((prev) => ({ ...prev, aboutBusiness: e.target.value }))}
                disabled={isLocked}
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheckIcon className="h-3 w-3" /> Visible only to Agri-Eco administrators.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.contactPerson)} *
                </Label>
                <Input
                  placeholder="Jane Uwimana"
                  value={form.contactPerson}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  required
                  disabled={isLocked}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.common.email)} *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="email"
                    placeholder="partner@business.rw"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isLocked}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.checkoutPage.phone)} *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="+250 7XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                    disabled={isLocked}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social & References */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Twitter className="h-5 w-5 text-primary" />
                Social Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.twitter)}
                </Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="https://x.com/yourbusiness"
                    value={form.twitter}
                    onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))}
                    disabled={isLocked}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t(translations.partnerPage.linkedin)}
                </Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="https://linkedin.com/company/yourbusiness"
                    value={form.linkedin}
                    onChange={(e) => setForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                    disabled={isLocked}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Reference URLs
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addLink}
                  className="h-8 gap-1 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl"
                  disabled={isLocked}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {form.links.length === 0 && (
                <div className="text-center py-5 border border-dashed border-border rounded-xl bg-muted/10">
                  <p className="text-xs text-muted-foreground italic">No additional references added.</p>
                </div>
              )}
              {form.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="https://..."
                    value={link}
                    onChange={(e) => updateLink(idx, e.target.value)}
                    disabled={isLocked}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:bg-destructive/5 rounded-xl"
                    onClick={() => removeLink(idx)}
                    disabled={isLocked}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-3 p-4 rounded-xl border border-border bg-muted/20">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-0.5"
            disabled={isLocked}
          />
          <div className="space-y-1 leading-none">
            <label htmlFor="terms" className="text-sm font-semibold cursor-pointer select-none">
              I agree to the Agri-Eco Partner Network Terms & Conditions and Privacy Policy.
            </label>
            <p className="text-xs text-muted-foreground">
              By checking this box, you confirm that the information provided is accurate and you understand our collaboration framework.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl w-full sm:w-auto"
            onClick={() => router.back()}
            disabled={submitApplicationMutation.isPending}
          >
            {t(translations.common.cancel)}
          </Button>
          <Button
            type="submit"
            className="rounded-xl px-8 w-full sm:w-auto"
            disabled={submitApplicationMutation.isPending || isLocked || !agreed}
          >
            {submitApplicationMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : status === "pending" ? (
              "Application Pending"
            ) : status === "approved" ? (
              "Already Approved"
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t(translations.partnerPage.submitApplication)}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}