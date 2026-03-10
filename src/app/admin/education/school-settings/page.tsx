"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function SchoolVisitSettingsPage() {
  const router = useRouter();
  const [heading, setHeading] = useState<MultiLangValue>(defaultConfig.heading);
  const [subheading, setSubheading] = useState<MultiLangValue>(
    defaultConfig.subheading,
  );
  const [inclusions, setInclusions] = useState<MultiLangValue[]>([
    ...defaultConfig.whatsIncluded,
  ]);
  const [details, setDetails] = useState([...defaultConfig.details]);
  const [subjects, setSubjects] = useState([
    ...defaultConfig.curriculumSubjects,
  ]);
  const [gradeLevels, setGradeLevels] = useState([
    ...defaultConfig.gradeLevels,
  ]);
  const [newInclusion, setNewInclusion] =
    useState<MultiLangValue>(emptyLangValue());

  const addInclusion = () => {
    if (!newInclusion.en.trim()) return;
    setInclusions([...inclusions, newInclusion]);
    setNewInclusion(emptyLangValue());
  };

  const removeInclusion = (idx: number) =>
    setInclusions(inclusions.filter((_, i) => i !== idx));

  const addDetail = () =>
    setDetails([
      ...details,
      {
        label: emptyLangValue(),
        value: emptyLangValue(),
      },
    ]);

  const updateDetail = (
    idx: number,
    field: "label" | "value",
    val: MultiLangValue,
  ) => {
    setDetails(details.map((d, i) => (i === idx ? { ...d, [field]: val } : d)));
  };

  const removeDetail = (idx: number) =>
    setDetails(details.filter((_, i) => i !== idx));

  const addSubject = () =>
    setSubjects([
      ...subjects,
      {
        id: `cs-${Date.now()}`,
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
    setGradeLevels([
      ...gradeLevels,
      { value: `grade-${Date.now()}`, label: emptyLangValue() },
    ]);

  const updateGradeLevel = (
    idx: number,
    field: "value" | "label",
    val: string | MultiLangValue,
  ) => {
    setGradeLevels(
      gradeLevels.map((g, i) =>
        i === idx ? ({ ...g, [field]: val } as any) : g,
      ),
    );
  };

  const removeGradeLevel = (idx: number) =>
    setGradeLevels(gradeLevels.filter((_, i) => i !== idx));

  const handleSave = () => {
    toast.success("Settings Saved!", {
      description: "School visit program settings have been updated.",
    });
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
        >
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

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
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
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

        {/* Program Details */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm border-t-4 border-t-amber-500/30">
          <h2 className="text-lg font-bold text-foreground">Program Details</h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Core program metadata
          </p>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {details.map((d, i) => (
              <div
                key={i}
                className="p-4 bg-muted/20 rounded-xl border border-border/50 space-y-3 group relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeDetail(i)}
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </Button>
                <MultiLangInput
                  label="Label"
                  value={d.label}
                  onChange={(val) => updateDetail(i, "label", val)}
                  placeholder="e.g., Duration"
                />
                <MultiLangInput
                  label="Value"
                  value={d.value}
                  onChange={(val) => updateDetail(i, "value", val)}
                  placeholder="e.g., 6 hours"
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={addDetail}
            className="w-full gap-1.5 h-10 font-bold text-xs shadow-xs hover:bg-card border-dashed"
          >
            <Plus className="h-4 w-4" /> Add Detail Row
          </Button>
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
              key={s.id}
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
                key={g.value}
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
                  value={g.label}
                  onChange={(val) => {
                    updateGradeLevel(i, "label", val);
                    updateGradeLevel(
                      i,
                      "value",
                      val.en.toLowerCase().replace(/\s+/g, "-"),
                    );
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
                  {details
                    .filter((d) => d.label.en)
                    .map((d, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-3.5 px-4 bg-muted/10 border-b border-border last:border-0 hover:bg-card transition-colors"
                      >
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          {d.label.en}
                        </span>
                        <span className="text-sm font-bold text-foreground text-right">
                          {d.value.en}
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
                        key={s.id}
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
      </div>
    </div>
  );
}
