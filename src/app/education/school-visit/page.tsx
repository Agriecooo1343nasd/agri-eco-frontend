"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  fetchPublicSchoolVisitSettings,
  submitSchoolVisit,
  type AdminSchoolVisitSettings,
} from "@/lib/api/education";
import {
  mergeSchoolVisitSettings,
  schoolVisitDetailLabels,
  schoolVisitMetaCopy,
  schoolVisitSectionTitles,
} from "@/lib/school-visit-settings";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  School,
  Users,
  Timer,
  Banknote,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { usePricing } from "@/context/PricingContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

type SchoolVisitForm = {
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  studentCount: string;
  gradeLevel: string;
  preferredDate: string;
  curriculumAlignment: string;
  specialRequirements: string;
};

const initialForm: SchoolVisitForm = {
  schoolName: "",
  contactPerson: "",
  email: "",
  phone: "",
  studentCount: "",
  gradeLevel: "",
  preferredDate: "",
  curriculumAlignment: "",
  specialRequirements: "",
};

export default function SchoolVisitPage() {
  const { t } = useLanguage();
  const { formatPrice } = usePricing();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<SchoolVisitForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<AdminSchoolVisitSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(false);

  const view = useMemo(
    () => mergeSchoolVisitSettings(settings),
    [settings],
  );

  const minStudents = settings?.minStudents ?? 10;
  const maxStudents = settings?.maxStudents ?? 50;

  useEffect(() => {
    let ignore = false;
    (async () => {
      setSettingsLoading(true);
      setSettingsError(false);
      try {
        const data = await fetchPublicSchoolVisitSettings();
        if (!ignore) setSettings(data);
      } catch {
        if (!ignore) {
          setSettingsError(true);
          setSettings(null);
        }
      } finally {
        if (!ignore) setSettingsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const detailRows = useMemo(() => {
    if (!settings) {
      return view.details.map((d) => ({
        label: t(d.label),
        value: t(d.value),
        icon: "clock" as const,
      }));
    }
    return [
      {
        label: t(schoolVisitDetailLabels.duration),
        value: settings.duration,
        icon: "clock" as const,
      },
      {
        label: t(schoolVisitDetailLabels.pricePerStudent),
        value: formatPrice(Number(settings.pricePerStudent ?? 0)),
        icon: "price" as const,
      },
      {
        label: t(schoolVisitDetailLabels.groupSize),
        value: `${settings.minStudents}–${settings.maxStudents}`,
        icon: "users" as const,
      },
    ];
  }, [settings, view.details, t, formatPrice]);

  const updateField = <K extends keyof SchoolVisitForm>(
    field: K,
    value: SchoolVisitForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error("Authentication required");
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    const min = settings?.minStudents ?? 10;
    const max = settings?.maxStudents ?? 50;

    if (
      !form.schoolName ||
      !form.contactPerson ||
      !form.email ||
      !form.phone ||
      !form.studentCount ||
      !form.gradeLevel ||
      !form.preferredDate
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const studentCount = Number(form.studentCount);
    if (Number.isNaN(studentCount) || studentCount < min || studentCount > max) {
      toast.error(
        `Number of students must be between ${min} and ${max}.`,
      );
      return;
    }

    setSubmitting(true);

    try {
      await submitSchoolVisit({
        institutionName: form.schoolName,
        contactName: form.contactPerson,
        email: form.email,
        phone: form.phone,
        studentCount,
        teacherCount: 1,
        preferredDate: form.preferredDate,
        curriculumGoals: form.curriculumAlignment || "",
        specialRequirements: form.specialRequirements || "",
      });

      setForm(initialForm);
      toast.success("Visit request submitted!", {
        description: "We'll confirm your booking within 48 hours.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Failed to submit request", {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const DetailIcon = ({ kind }: { kind: "clock" | "price" | "users" }) => {
    const className = "h-4 w-4 text-primary shrink-0 mt-0.5";
    if (kind === "price") return <Banknote className={className} />;
    if (kind === "users") return <UsersRound className={className} />;
    return <Timer className={className} />;
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        <section className="border-b border-border bg-primary/5">
          <div className="container py-10 md:py-14">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <Badge className="mb-4 gap-1.5 bg-secondary text-secondary-foreground text-[10px] py-0 px-2 max-w-full">
                  <School className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t(view.heading)}</span>
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">
                  {t({ en: "Book a school visit", rw: "Andika urugendo rw'ishuri", fr: "Réserver une visite scolaire", sw: "Weka ziara ya shule" })}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(view.subheading)}
                </p>
              </div>
              <Link href="/education">
                <Button variant="outline" className="gap-2 w-full md:w-auto">
                  <ArrowLeft className="h-4 w-4" /> {t({ en: "Back to Education", rw: "Subira ku masomo", fr: "Retour à Éducation", sw: "Rudi kwenye Elimu" })}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="font-bold font-heading text-foreground text-lg mb-1">
                      {t({ en: "Visit request form", rw: "Ifishi y'icyifuzo", fr: "Formulaire de demande", sw: "Fomu ya ombi" })}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t({
                        en: "Provide the details below as they should appear on your booking.",
                        rw: "Tanga amakuru nk'uko ukeneye ko aboneka ku cyandiko cyawe.",
                        fr: "Indiquez les informations telles qu'elles doivent figurer sur la réservation.",
                        sw: "Toa maelezo kama yanavyoonekana kwenye uhifadhi wako.",
                      })}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "School name", rw: "Izina ry'ishuri", fr: "Nom de l'école", sw: "Jina la shule" })} *
                      </Label>
                      <Input
                        required
                        value={form.schoolName}
                        onChange={(e) =>
                          updateField("schoolName", e.target.value)
                        }
                        placeholder="e.g. Green Hills Academy"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "Contact person", rw: "Umuntu w'itumanaho", fr: "Personne de contact", sw: "Mhusika wa mawasiliano" })} *
                      </Label>
                      <Input
                        required
                        value={form.contactPerson}
                        onChange={(e) =>
                          updateField("contactPerson", e.target.value)
                        }
                        placeholder={t({ en: "Teacher name", rw: "Izina ry'umwarimu", fr: "Nom de l'enseignant", sw: "Jina la mwalimu" })}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">Email *</Label>
                      <Input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="contact@school.rw"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "Phone", rw: "Telefoni", fr: "Téléphone", sw: "Simu" })} *
                      </Label>
                      <Input
                        required
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+250 7XX XXX XXX"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "Number of students", rw: "Umubare w'abanyeshuri", fr: "Nombre d'élèves", sw: "Idadi ya wanafunzi" })} *
                      </Label>
                      <Input
                        type="number"
                        required
                        min={minStudents}
                        max={maxStudents}
                        value={form.studentCount}
                        onChange={(e) =>
                          updateField("studentCount", e.target.value)
                        }
                        placeholder={String(minStudents)}
                        className="h-9 text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {t({ en: "Allowed range:", rw: "Intera yemewe:", fr: "Fourchette autorisée :", sw: "Masafa yanayoruhusiwa:" })}{" "}
                        {minStudents}–{maxStudents}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "Grade level", rw: "Icyiciro", fr: "Niveau", sw: "Kiwango" })} *
                      </Label>
                      <Select
                        value={form.gradeLevel}
                        onValueChange={(value) =>
                          updateField("gradeLevel", value)
                        }
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder={t({ en: "Select grade", rw: "Hitamo icyiciro", fr: "Choisir le niveau", sw: "Chagua kiwango" })} />
                        </SelectTrigger>
                        <SelectContent>
                          {view.gradeLevels.map((level) => (
                            <SelectItem
                              key={level.value}
                              value={level.value}
                              className="text-xs"
                            >
                              {t(level.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "Preferred date", rw: "Itariki wifuza", fr: "Date souhaitée", sw: "Tarehe unayopenda" })} *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal h-9 text-xs border-input px-3 ${!form.preferredDate ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.preferredDate ? format(new Date(form.preferredDate), "PPP") : <span>{t({ en: "Pick a date", rw: "Hitamo itariki", fr: "Choisir une date", sw: "Chagua tarehe" })}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                          <Calendar
                            mode="single"
                            selected={form.preferredDate ? new Date(form.preferredDate) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                updateField("preferredDate", localDate.toISOString().split("T")[0]);
                              } else {
                                updateField("preferredDate", "");
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "Curriculum alignment", rw: "Guhuza n'amashuri", fr: "Alignement pédagogique", sw: "Muundo wa mtaala" })}
                      </Label>
                      <Select
                        value={form.curriculumAlignment}
                        onValueChange={(value) =>
                          updateField("curriculumAlignment", value)
                        }
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder={t({ en: "Select subject", rw: "Hitamo isomo", fr: "Choisir une matière", sw: "Chagua somo" })} />
                        </SelectTrigger>
                        <SelectContent>
                          {view.curriculumSubjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.id}
                              className="text-xs"
                            >
                              {t(subject.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] mb-1 block">
                        {t({ en: "Special requirements", rw: "Ibindi bisabwa", fr: "Besoins particuliers", sw: "Mahitaji maalum" })}
                      </Label>
                      <Textarea
                        value={form.specialRequirements}
                        onChange={(e) =>
                          updateField("specialRequirements", e.target.value)
                        }
                        placeholder={t({ en: "Dietary needs, accessibility, etc.", rw: "Ibiribwa, uko ubashyira, n'ibindi.", fr: "Régime alimentaire, accessibilité, etc.", sw: "Lishe, upatikanaji, n.k." })}
                        className="text-xs"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-xs h-10"
                    disabled={submitting}
                  >
                    {submitting
                      ? t({ en: "Submitting…", rw: "Kohereza…", fr: "Envoi…", sw: "Inatumwa…" })
                      : t({ en: "Submit booking request", rw: "Ohereza icyifuzo", fr: "Envoyer la demande", sw: "Wasilisha ombi" })}
                  </Button>
                </form>
              </div>

              <div className="space-y-6">
                {settingsError && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                    {t({
                      en: "Could not load live program settings; showing defaults.",
                      rw: "Ntibyashobotse kubona amagenamiterere; turimo kwerekana ibisanzwe.",
                      fr: "Impossible de charger les paramètres; affichage par défaut.",
                      sw: "Imepaki haijapakiwa; tunaonyesha chaguo-msingi.",
                    })}
                  </p>
                )}

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold font-heading text-foreground text-lg mb-1">
                    {t(schoolVisitSectionTitles.whatsIncluded)}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {t({
                      en: "Included in every visit (from your latest configuration).",
                      rw: "Birimo mu rugendo rwose (kuva ku mitegurire yawe).",
                      fr: "Inclus dans chaque visite (selon la configuration).",
                      sw: "Kinajumuishwa katika kila ziara (kulingana na mipangilio).",
                    })}
                  </p>
                  {settingsLoading ? (
                    <ul className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="flex gap-2">
                          <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                          <Skeleton className="h-4 flex-1" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-3">
                      {view.whatsIncluded.map((item) => (
                        <li
                          key={t(item)}
                          className="flex items-start gap-3 text-sm text-foreground leading-snug"
                        >
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {t(item)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold font-heading text-foreground text-lg mb-1">
                    {t(schoolVisitSectionTitles.programDetails)}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {t({
                      en: "Key facts for planning your trip.",
                      rw: "Amakuru ngombwa yo gutegura urugendo rwawe.",
                      fr: "Faits clés pour organiser votre visite.",
                      sw: "Ukweli muhimu wa kupanga ziara yako.",
                    })}
                  </p>
                  {settingsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <dl className="space-y-0 rounded-xl border border-border/80 bg-muted/20 divide-y divide-border/80 overflow-hidden">
                      {detailRows.map((row, idx) => (
                        <div
                          key={`${row.label}-${idx}`}
                          className="flex gap-3 px-4 py-3.5 items-start"
                        >
                          <DetailIcon kind={row.icon} />
                          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                            <dt className="text-muted-foreground text-[11px] sm:text-xs font-medium">
                              {row.label}
                            </dt>
                            <dd className="text-sm font-semibold text-foreground text-left sm:text-right tabular-nums">
                              {row.value}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t(schoolVisitMetaCopy.advanceBookingTitle)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {t(schoolVisitMetaCopy.advanceBookingBody)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t(schoolVisitMetaCopy.groupSizeTitle)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {t(schoolVisitMetaCopy.groupSizeBetween)}{" "}
                        {settings?.minStudents ?? minStudents}–
                        {settings?.maxStudents ?? maxStudents}{" "}
                        {t(schoolVisitMetaCopy.studentsWord)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t(schoolVisitMetaCopy.confirmationTitle)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {t(schoolVisitMetaCopy.confirmationBody)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
