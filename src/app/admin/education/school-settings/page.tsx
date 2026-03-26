"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { schoolVisitConfig as defaultConfig } from "@/data/education";
import {
  ArrowLeft,
  Plus,
  X,
  Save,
  CheckCircle,
  BookOpen,
  GraduationCap,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  MultiLangInput,
  type MultiLangValue,
  emptyLangValue,
} from "@/components/admin/MultiLangInput";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  fetchAdminSchoolVisitSettings,
  updateAdminSchoolVisitSettings,
  type MultiLangText,
  type AdminSchoolVisitSettings,
  type UpsertAdminSchoolVisitSettingsPayload,
} from "@/lib/api/education";

type SubjectForm = { name: MultiLangValue; description: MultiLangValue };

const toMultiLangFromApi = (value?: MultiLangText): MultiLangValue => ({
  en: value?.en ?? "",
  rw: value?.rw ?? "",
  fr: value?.fr ?? "",
  sw: value?.sw ?? "",
});

const toRequiredApiML = (value: MultiLangValue): MultiLangText => {
  const en = value.en.trim();
  const rw = value.rw.trim();
  const fr = value.fr.trim();
  const sw = value.sw.trim();

  return {
    en,
    ...(rw ? { rw } : {}),
    ...(fr ? { fr } : {}),
    ...(sw ? { sw } : {}),
  };
};

const toOptionalApiML = (value: MultiLangValue): MultiLangText | undefined => {
  const hasAny = Object.values(value).some((item) => item.trim().length > 0);
  if (!hasAny) return undefined;
  if (!value.en.trim()) return undefined;
  return toRequiredApiML(value);
};

const buildDefaultState = () => ({
  heading: { ...defaultConfig.heading },
  subheading: { ...defaultConfig.subheading },
  inclusions: defaultConfig.whatsIncluded.map((item) => ({ ...item })),
  subjects: defaultConfig.curriculumSubjects.map((item) => ({
    name: { ...item.name },
    description: item.description ? { ...item.description } : emptyLangValue(),
  })),
  gradeLevels: defaultConfig.gradeLevels.map((item) => ({ ...item.label })),
  duration: "Full day (6 hours)",
  pricePerStudent: "2000",
  minStudents: "10",
  maxStudents: "50",
  isActive: true,
});

export default function SchoolVisitSettingsPage() {
  const router = useRouter();
  const defaultState = buildDefaultState();

  const [heading, setHeading] = useState<MultiLangValue>(defaultState.heading);
  const [subheading, setSubheading] = useState<MultiLangValue>(
    defaultState.subheading,
  );
  const [inclusions, setInclusions] = useState<MultiLangValue[]>(
    defaultState.inclusions,
  );
  const [subjects, setSubjects] = useState<SubjectForm[]>(
    defaultState.subjects,
  );
  const [gradeLevels, setGradeLevels] = useState<MultiLangValue[]>(
    defaultState.gradeLevels,
  );
  const [duration, setDuration] = useState(defaultState.duration);
  const [pricePerStudent, setPricePerStudent] = useState(
    defaultState.pricePerStudent,
  );
  const [minStudents, setMinStudents] = useState(defaultState.minStudents);
  const [maxStudents, setMaxStudents] = useState(defaultState.maxStudents);
  const [isActive, setIsActive] = useState(defaultState.isActive);
  const [initialized, setInitialized] = useState(false);
  const [newInclusion, setNewInclusion] =
    useState<MultiLangValue>(emptyLangValue());

  const settingsQuery = useQuery({
    queryKey: ["admin-school-visit-settings"],
    queryFn: fetchAdminSchoolVisitSettings,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: UpsertAdminSchoolVisitSettingsPayload) =>
      updateAdminSchoolVisitSettings(payload),
    onSuccess: () => {
      toast.success("Settings saved", {
        description: "School visit settings have been updated successfully.",
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update school visit settings";
      toast.error("Save failed", { description: message });
    },
  });

  useEffect(() => {
    if (!settingsQuery.isFetched || initialized) return;

    const settings = settingsQuery.data ?? null;
    if (!settings) {
      setInitialized(true);
      return;
    }

    setHeading(toMultiLangFromApi(settings.sectionHeading));
    setSubheading(toMultiLangFromApi(settings.sectionSubheading));
    setInclusions(
      (settings.inclusions ?? [])
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((item: any) => toMultiLangFromApi(item.text)),
    );
    setSubjects(
      (settings.subjects ?? [])
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((item: any) => ({
          name: toMultiLangFromApi(item.name),
          description: toMultiLangFromApi(item.description),
        })),
    );
    setGradeLevels(
      (settings.gradeLevels ?? [])
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((item: any) => toMultiLangFromApi(item.label)),
    );
    setDuration(settings.duration || "Full day (6 hours)");
    setPricePerStudent(String(settings.pricePerStudent ?? 2000));
    setMinStudents(String(settings.minStudents ?? 10));
    setMaxStudents(String(settings.maxStudents ?? 50));
    setIsActive(Boolean(settings.isActive));
    setInitialized(true);
  }, [initialized, settingsQuery.data, settingsQuery.isFetched]);

  const addInclusion = () => {
    if (!newInclusion.en.trim()) return;
    setInclusions([...inclusions, newInclusion]);
    setNewInclusion(emptyLangValue());
  };

  const removeInclusion = (idx: number) =>
    setInclusions(inclusions.filter((_, i) => i !== idx));

  const addSubject = () =>
    setSubjects([
      ...subjects,
      {
        name: emptyLangValue(),
        description: emptyLangValue(),
      },
    ]);

  const updateSubject = (
    idx: number,
    field: "name" | "description",
    val: MultiLangValue,
  ) => {
    setSubjects(
      subjects.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    );
  };

  const removeSubject = (idx: number) =>
    setSubjects(subjects.filter((_, i) => i !== idx));

  const addGradeLevel = () =>
    setGradeLevels([...gradeLevels, emptyLangValue()]);

  const updateGradeLevel = (idx: number, val: MultiLangValue) => {
    setGradeLevels(gradeLevels.map((g, i) => (i === idx ? val : g)));
  };

  const removeGradeLevel = (idx: number) =>
    setGradeLevels(gradeLevels.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!heading.en.trim()) {
      toast.error("Section heading is required in English.");
      return;
    }

    if (!subheading.en.trim()) {
      toast.error("Section subheading is required in English.");
      return;
    }

    const parsedPrice = Number.parseFloat(pricePerStudent);
    const parsedMinStudents = Number.parseInt(minStudents, 10);
    const parsedMaxStudents = Number.parseInt(maxStudents, 10);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Price per student must be 0 or greater.");
      return;
    }

    if (!Number.isFinite(parsedMinStudents) || parsedMinStudents < 1) {
      toast.error("Minimum students must be at least 1.");
      return;
    }

    if (!Number.isFinite(parsedMaxStudents) || parsedMaxStudents < 1) {
      toast.error("Maximum students must be at least 1.");
      return;
    }

    if (parsedMinStudents > parsedMaxStudents) {
      toast.error("Minimum students cannot exceed maximum students.");
      return;
    }

    const inclusionRows = inclusions
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.en.trim());

    const subjectRows = subjects
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.name.en.trim());

    const gradeRows = gradeLevels
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.en.trim());

    const hasInvalidDescription = subjectRows.some(({ item }) => {
      const description = item.description;
      const hasAnyDescription = Object.values(description).some(
        (value) => value.trim().length > 0,
      );
      return hasAnyDescription && !description.en.trim();
    });

    if (hasInvalidDescription) {
      toast.error(
        "Any subject description must include English text when provided.",
      );
      return;
    }

    const payload: UpsertAdminSchoolVisitSettingsPayload = {
      sectionHeading: toRequiredApiML(heading),
      sectionSubheading: toRequiredApiML(subheading),
      inclusions: inclusionRows.map(({ item }, idx) => ({
        text: toRequiredApiML(item),
        sortOrder: idx,
      })),
      subjects: subjectRows.map(({ item }, idx) => ({
        name: toRequiredApiML(item.name),
        description: toOptionalApiML(item.description),
        sortOrder: idx,
      })),
      gradeLevels: gradeRows.map(({ item }, idx) => ({
        label: toRequiredApiML(item),
        sortOrder: idx,
      })),
      duration: duration.trim() || "Full day (6 hours)",
      pricePerStudent: parsedPrice,
      minStudents: parsedMinStudents,
      maxStudents: parsedMaxStudents,
      isActive,
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/education")}
          className="shrink-0 transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            School Visit Settings
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Configure what&apos;s displayed on the school visit programs section
          </p>
        </div>
        <Button
          className="gap-2 h-10 px-6 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 transition-all active:scale-95"
          onClick={handleSave}
          disabled={saveMutation.isPending || settingsQuery.isLoading}
        >
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      {settingsQuery.isError && (
        <div className="rounded-md border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">
          Failed to load existing school visit settings. You can still edit and
          save to create/update settings.
        </div>
      )}

      {/* Heading & Subheading */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Display Settings</h2>
        <MultiLangInput
          label="Section Heading"
          value={heading}
          onChange={setHeading}
          placeholder="e.g., School Visit Programs"
          required
        />
        <MultiLangInput
          label="Section Subheading"
          value={subheading}
          onChange={setSubheading}
          placeholder="e.g., Curriculum-aligned farm visits"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What's Included */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm border-t-4 border-t-primary/30">
          <h2 className="text-lg font-bold text-foreground">
            What&apos;s Included
          </h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Benefits & inclusions
          </p>
          <div className="space-y-4 max-h-100 overflow-y-auto pr-1 custom-scrollbar">
            {inclusions.map((item, i) => (
              <div
                key={i}
                className="bg-muted/30 rounded-lg p-3 border border-border/50 group hover:border-primary/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-foreground">
                      Inclusion #{i + 1}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeInclusion(i)}
                  >
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <MultiLangInput
                  value={item}
                  onChange={(val) => {
                    const newInc = [...inclusions];
                    newInc[i] = val;
                    setInclusions(newInc);
                  }}
                  hideLabel
                  placeholder="Inclusion content"
                />
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-2 border-t border-border mt-2">
            <MultiLangInput
              label="Add New Inclusion"
              value={newInclusion}
              onChange={setNewInclusion}
              placeholder="e.g., Guided farm tour"
            />
            <Button
              variant="outline"
              onClick={addInclusion}
              className="w-full gap-1.5 h-10 font-bold text-xs shadow-xs hover:bg-card"
            >
              <Plus className="h-4 w-4" /> Add Inclusion
            </Button>
          </div>
        </div>

        {/* Visit Logistics */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm border-t-4 border-t-amber-500/30">
          <h2 className="text-lg font-bold text-foreground">Visit Logistics</h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Backend-driven booking constraints
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Duration Label
              </p>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Full day (6 hours)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Price Per Student (RWF)
                </p>
                <Input
                  type="number"
                  min={0}
                  value={pricePerStudent}
                  onChange={(e) => setPricePerStudent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Active
                </p>
                <div className="h-10 px-3 border border-border rounded-md flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Accept school visit requests
                  </span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Minimum Students
                </p>
                <Input
                  type="number"
                  min={1}
                  value={minStudents}
                  onChange={(e) => setMinStudents(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Maximum Students
                </p>
                <Input
                  type="number"
                  min={1}
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Subjects */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
              <BookOpen className="h-5 w-5 text-primary" /> Curriculum Subjects
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Available subjects for curriculum alignment
            </p>
          </div>
          <Button
            variant="outline"
            onClick={addSubject}
            className="gap-1.5 h-10 text-xs font-bold shadow-xs hover:bg-card"
          >
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((s, i) => (
            <div
              key={`${s.name.en}-${i}`}
              className="flex items-start gap-4 bg-muted/20 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <MultiLangInput
                  label="Subject Name"
                  value={s.name}
                  onChange={(val) => updateSubject(i, "name", val)}
                  placeholder="Subject name"
                />
                <MultiLangInput
                  label="Description"
                  value={s.description || emptyLangValue()}
                  onChange={(val) => updateSubject(i, "description", val)}
                  placeholder="Brief description"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeSubject(i)}
              >
                <X className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="col-span-full border border-dashed border-border rounded-xl py-10 text-center bg-card/50">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                No subjects configured
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grade Levels */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
              <GraduationCap className="h-5 w-5 text-primary" /> Grade Levels
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Available levels for bookings
            </p>
          </div>
          <Button
            variant="outline"
            onClick={addGradeLevel}
            className="gap-1.5 h-10 text-xs font-bold shadow-xs hover:bg-card"
          >
            <Plus className="h-4 w-4" /> Add Level
          </Button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gradeLevels.map((g, i) => (
              <div
                key={`${g.en}-${i}`}
                className="p-4 bg-muted/20 rounded-xl border border-border/50 space-y-3 group relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeGradeLevel(i)}
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </Button>
                <MultiLangInput
                  label="Level Label"
                  value={g}
                  onChange={(val) => {
                    updateGradeLevel(i, val);
                  }}
                  placeholder="e.g., Primary 1-3"
                />
              </div>
            ))}
          </div>
          {gradeLevels.length === 0 && (
            <div className="border border-dashed border-border rounded-xl py-10 text-center bg-card/50">
              <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                No grade levels configured
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card border border-border rounded-xl p-8 shadow-md border-t-8 border-t-primary/20">
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
          Public Page Preview
        </h2>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <School className="h-48 w-48" />
          </div>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold font-heading text-foreground text-center mb-2 tracking-tight">
              {heading.en || "Heading"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-10 font-medium leading-relaxed italic">
              {subheading.en || "Subheading text goes here"}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">
                  What's Included
                </h4>
                <ul className="space-y-3">
                  {inclusions.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-foreground group font-medium"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      {item.en}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-4">
                  Visit Logistics
                </h4>
                <div className="space-y-0.5 border border-border rounded-xl overflow-hidden shadow-sm">
                  {[
                    { label: "Duration", value: duration || "-" },
                    {
                      label: "Price per Student",
                      value: `${Number.parseFloat(pricePerStudent || "0") || 0} RWF`,
                    },
                    { label: "Minimum Students", value: minStudents || "-" },
                    { label: "Maximum Students", value: maxStudents || "-" },
                  ].map((d, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-3.5 px-4 bg-muted/10 border-b border-border last:border-0 hover:bg-card transition-colors"
                    >
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {d.label}
                      </span>
                      <span className="text-sm font-bold text-foreground text-right">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {subjects.length > 0 && (
              <div className="pt-8 border-t border-border">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center mb-5">
                  Curriculum Alignment Expertise
                </h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {subjects
                    .filter((s) => s.name.en)
                    .map((s) => (
                      <span
                        key={s.name.en}
                        className="text-xs font-bold bg-primary/5 text-primary px-5 py-2 rounded-full border border-primary/20 shadow-xs hover:bg-primary hover:text-white transition-all cursor-default"
                      >
                        {s.name.en}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-6 text-center font-bold font-serif opacity-60">
          This is how the section will appear to schools and educators browsing
          the site.
        </p>

        <div className="pt-4 flex justify-center">
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="text-[10px] uppercase tracking-wide"
          >
            {isActive ? "Currently Active" : "Currently Inactive"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
