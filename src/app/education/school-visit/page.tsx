"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { schoolVisitConfig } from "@/data/education";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  School,
  Users,
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
  const [form, setForm] = useState<SchoolVisitForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const minimumDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split("T")[0];
  }, []);

  const updateField = <K extends keyof SchoolVisitForm>(
    field: K,
    value: SchoolVisitForm[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    if (Number.isNaN(studentCount) || studentCount < 10 || studentCount > 50) {
      toast.error("Number of Students must be between 10 and 50.");
      return;
    }

    if (form.preferredDate < minimumDate) {
      toast.error("Preferred Date must be at least 2 weeks from today.");
      return;
    }

    setSubmitting(true);

    window.setTimeout(() => {
      setSubmitting(false);
      setForm(initialForm);
      toast.success("Visit Request Submitted!", {
        description: "We'll confirm your booking within 48 hours.",
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        <section className="border-b border-border bg-primary/5">
          <div className="container py-10 md:py-14">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <Badge className="mb-4 gap-1.5 bg-secondary text-secondary-foreground text-[10px] py-0 px-2">
                  <School className="h-3.5 w-3.5" /> School Visit Programs
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">
                  Book a School Visit
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fill in your school details and submit a new visit request.
                  We&apos;ll confirm your booking within 48 hours.
                </p>
              </div>
              <Link href="/education">
                <Button variant="outline" className="gap-2 w-full md:w-auto">
                  <ArrowLeft className="h-4 w-4" /> Back to Education
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
                      Visit Request Form
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Please provide the information below exactly as you want
                      it recorded for your booking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] mb-1 block">
                        School Name *
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
                        Contact Person *
                      </Label>
                      <Input
                        required
                        value={form.contactPerson}
                        onChange={(e) =>
                          updateField("contactPerson", e.target.value)
                        }
                        placeholder="Teacher name"
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
                      <Label className="text-[11px] mb-1 block">Phone *</Label>
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
                        Number of Students *
                      </Label>
                      <Input
                        type="number"
                        required
                        min={10}
                        max={50}
                        value={form.studentCount}
                        onChange={(e) =>
                          updateField("studentCount", e.target.value)
                        }
                        placeholder="e.g. 35"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">
                        Grade Level *
                      </Label>
                      <Select
                        value={form.gradeLevel}
                        onValueChange={(value) =>
                          updateField("gradeLevel", value)
                        }
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolVisitConfig.gradeLevels.map((level) => (
                            <SelectItem
                              key={level.value}
                              value={level.value}
                              className="text-xs"
                            >
                              {level.label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">
                        Preferred Date *
                      </Label>
                      <Input
                        type="date"
                        required
                        min={minimumDate}
                        value={form.preferredDate}
                        onChange={(e) =>
                          updateField("preferredDate", e.target.value)
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] mb-1 block">
                        Curriculum Alignment
                      </Label>
                      <Select
                        value={form.curriculumAlignment}
                        onValueChange={(value) =>
                          updateField("curriculumAlignment", value)
                        }
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolVisitConfig.curriculumSubjects.map(
                            (subject) => (
                              <SelectItem
                                key={subject.id}
                                value={subject.id}
                                className="text-xs"
                              >
                                {subject.name.en}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[11px] mb-1 block">
                        Special Requirements
                      </Label>
                      <Textarea
                        value={form.specialRequirements}
                        onChange={(e) =>
                          updateField("specialRequirements", e.target.value)
                        }
                        placeholder="Dietary needs, etc."
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
                      ? "Submitting Booking Request..."
                      : "Submit Booking Request"}
                  </Button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-bold font-heading text-foreground text-lg mb-4">
                    What&apos;s Included
                  </h2>
                  <ul className="space-y-3">
                    {schoolVisitConfig.whatsIncluded.map((item) => (
                      <li
                        key={item.en}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item.en}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-bold font-heading text-foreground text-lg mb-4">
                    Program Details
                  </h2>
                  <div className="space-y-2 text-xs">
                    {schoolVisitConfig.details.map((detail) => (
                      <div
                        key={detail.label.en}
                        className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
                      >
                        <span className="text-muted-foreground">
                          {detail.label.en}
                        </span>
                        <span className="font-bold text-foreground text-right">
                          {detail.value.en}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Advance Booking
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requests should be submitted at least 2 weeks before
                        your preferred visit date.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Group Size
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visits currently support groups of 10 to 50 students.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Confirmation Window
                      </p>
                      <p className="text-xs text-muted-foreground">
                        We review requests and confirm schedules within 48
                        hours.
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
