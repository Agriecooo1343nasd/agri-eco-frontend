"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { type SchoolVisit } from "@/data/education";
import {
  GraduationCap,
  School,
  Plus,
  Menu,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  Calendar,
  Settings,
} from "lucide-react"; // Icons import
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SchoolVisitActions } from "@/components/admin/SchoolVisitActions";
import { usePricing } from "@/context/PricingContext";
import {
  fetchAdminSchoolVisits,
  fetchAdminTrainingEnrollments,
  fetchAdminTrainingPrograms,
  type AdminSchoolVisit,
} from "@/lib/api/education";
import { useLanguage } from "@/context/LanguageContext";

const statusBadge: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  full: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeLabel: Record<string, string> = {
  workshop: "Workshop",
  course: "Course",
  certification: "Certification",
};

const levelLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function formatDate(value?: string) {
  if (!value) return "TBD";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function visitToUi(visit: AdminSchoolVisit): SchoolVisit {
  return {
    id: visit.id,
    schoolName: visit.institutionName,
    contactPerson: visit.contactName,
    email: visit.email,
    phone: visit.phone,
    studentCount: visit.studentCount,
    gradeLevel: `${visit.teacherCount} teachers`,
    preferredDate: formatDate(visit.preferredDate),
    status: visit.status === "rejected" ? "cancelled" : visit.status,
    curriculumAlignment: visit.curriculumGoals || "Not provided",
    specialNeeds: undefined,
    createdAt: visit.createdAt,
  };
}

export default function AdminEducationPage() {
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"programs" | "visits">("programs");
  const [visitsUiOverride, setVisitsUiOverride] = useState<
    Record<string, SchoolVisit["status"]>
  >({});

  const programsQuery = useQuery({
    queryKey: ["admin-training-programs"],
    queryFn: () =>
      fetchAdminTrainingPrograms({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
      }),
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["admin-training-enrollments"],
    queryFn: () =>
      fetchAdminTrainingEnrollments({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
      }),
  });

  const visitsQuery = useQuery({
    queryKey: ["admin-school-visits"],
    enabled: activeTab === "visits",
    queryFn: () =>
      fetchAdminSchoolVisits({
        page: 1,
        limit: 100,
        sort: "createdAt",
        order: "desc",
      }),
    staleTime: 60_000,
  });

  const enrollmentCountByProgram = useMemo(() => {
    const map = new Map<string, number>();
    for (const enrollment of enrollmentsQuery.data?.data ?? []) {
      const current = map.get(enrollment.trainingProgramId) ?? 0;
      map.set(enrollment.trainingProgramId, current + 1);
    }
    return map;
  }, [enrollmentsQuery.data?.data]);

  const programRows = useMemo(() => {
    // Safely extract a string from either a plain string or a MultiLangText object
    const resolveText = (v: any): string => {
      if (!v) return "";
      if (typeof v === "string") return v;
      if (typeof v === "object") return v.en || v.rw || v.fr || v.sw || "";
      return String(v);
    };

    return (programsQuery.data?.data ?? []).map((program) => {
      const enrolled = enrollmentCountByProgram.get(program.id) ?? 0;
      const capacity = Number(program.capacity || 0);

      let status: "open" | "full" | "upcoming" | "completed";
      if (!program.isPublished) {
        status = "upcoming";
      } else if (capacity > 0 && enrolled >= capacity) {
        status = "full";
      } else {
        status = "open";
      }

      const progressPct =
        capacity > 0 ? Math.min((enrolled / capacity) * 100, 100) : 0;

      return {
        id: program.id,
        title: resolveText(program.title) || "Untitled Program",
        duration: `${program.durationWeeks || 0} weeks`,
        type: program.type,
        level: resolveText(program.level) || program.level,
        enrolled,
        capacity,
        progressPct,
        schedule: formatDate(program.startDate),
        price: Number(program.priceRwf || 0),
        status,
      };
    });
  }, [programsQuery.data?.data, enrollmentCountByProgram]);

  const schoolVisitRows = useMemo(
    () =>
      (visitsQuery.data?.data ?? []).map((visit: AdminSchoolVisit) => {
        const converted = visitToUi(visit);
        const overridden = visitsUiOverride[converted.id];
        return overridden ? { ...converted, status: overridden } : converted;
      }),
    [visitsQuery.data?.data, visitsUiOverride],
  );

  const activePrograms = programRows.filter((p) => p.status === "open").length;
  const totalEnrolled = enrollmentsQuery.data?.pagination.total ?? 0;
  const pendingVisits = schoolVisitRows.filter(
    (v: SchoolVisit) => v.status === "pending",
  ).length;
  const totalStudents = schoolVisitRows.reduce(
    (sum: number, visit: SchoolVisit) => sum + visit.studentCount,
    0,
  );

  const isLoadingAny = programsQuery.isLoading || enrollmentsQuery.isLoading;

  const hasFetchError =
    programsQuery.isError ||
    enrollmentsQuery.isError ||
    (activeTab === "visits" && visitsQuery.isError);

  const handleVisitStatusChange = (
    visitId: string,
    newStatus: SchoolVisit["status"],
  ) => {
    setVisitsUiOverride((prev) => ({ ...prev, [visitId]: newStatus }));
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Education Hub Management
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Coordinate training sessions, handle school visits, and educational
            content.
          </p>
        </div>
        <Button
          className="gap-2 text-xs font-bold h-10 px-6 shadow-sm"
          onClick={() => router.push("/admin/education/create-program")}
        >
          <Plus className="h-4 w-4" /> Add Training Program
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Programs",
            value: activePrograms,
            icon: GraduationCap,
          },
          {
            label: "Total Enrolled",
            value: totalEnrolled,
            icon: Users,
          },
          {
            label: "Pending Visits",
            value: pendingVisits,
            icon: Clock,
          },
          {
            label: "Total Students",
            value: totalStudents,
            icon: School,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div
              className={`w-9 h-9 bg-muted/30 rounded-lg flex items-center justify-center mb-3 border border-border group-hover:bg-primary group-hover:text-white transition-all`}
            >
              <s.icon
                className={`h-5 w-5 text-muted-foreground group-hover:text-white transition-colors`}
              />
            </div>
            <p className="text-2xl font-bold font-heading text-foreground mb-0.5">
              {isLoadingAny ? "..." : s.value}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "programs" | "visits")}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 p-1 h-auto gap-1 border border-border">
            <TabsTrigger
              value="programs"
              className="text-xs px-4 py-2 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Training Programs
            </TabsTrigger>
            <TabsTrigger
              value="visits"
              className="text-xs px-4 py-2 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              School Visits
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-bold h-9 bg-card hover:bg-muted"
            onClick={() => router.push("/admin/education/school-settings")}
          >
            <Settings className="h-3.5 w-3.5" />
            School Visit Settings
          </Button>
        </div>

        <TabsContent value="programs">
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Program / Context
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Category
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Level
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Enrollment Progress
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Schedule
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Registration Fee
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programRows.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <p className="font-bold text-foreground text-[11px] mb-0.5">
                          {p.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {p.duration}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] font-bold py-0 px-2 tracking-tight bg-muted/50"
                        >
                          {typeLabel[p.type] ?? p.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold capitalize text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                          {levelLabel[p.level] ?? p.level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1 px-0.5">
                          <span>
                            {p.enrolled} / {p.capacity}
                          </span>
                          <span className="text-muted-foreground opacity-70">
                            {Math.round(p.progressPct)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden w-24 border border-border">
                          <div
                            className="h-full bg-primary rounded-full shadow-sm"
                            style={{
                              width: `${p.progressPct}%`,
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-foreground">
                        {p.schedule}
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-sm">
                        {formatPrice(Number(p.price || 0))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusBadge[p.status]} border text-[10px] font-bold py-0 px-2 shadow-none capitalize`}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted"
                            >
                              <Menu className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/education/stats/${p.id}`)
                              }
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Stats
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/education/edit/${p.id}`)
                              }
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit Content
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visits">
          <div className="border border-border rounded-sm overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Institution Name
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Lead Contact
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Student Volume
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Level/Grade
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Proposed Date
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Verification Status
                    </TableHead>
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitsQuery.isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-xs text-muted-foreground py-8"
                      >
                        Loading school visits...
                      </TableCell>
                    </TableRow>
                  )}

                  {!visitsQuery.isLoading && visitsQuery.isError && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-xs text-destructive py-8"
                      >
                        Failed to load school visits.
                      </TableCell>
                    </TableRow>
                  )}

                  {!visitsQuery.isLoading &&
                    !visitsQuery.isError &&
                    schoolVisitRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-xs text-muted-foreground py-8"
                        >
                          No visit is found.
                        </TableCell>
                      </TableRow>
                    )}

                  {!visitsQuery.isLoading &&
                    !visitsQuery.isError &&
                    schoolVisitRows.map((v: SchoolVisit) => (
                      <TableRow
                        key={v.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <p className="font-bold text-foreground text-[11px] mb-0.5">
                            {v.schoolName}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold italic truncate max-w-40">
                            {v.curriculumAlignment}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-[10px] font-bold text-foreground">
                            {v.contactPerson}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium underline underline-offset-2">
                            {v.email}
                          </p>
                        </TableCell>
                        <TableCell className="text-[11px] font-bold text-foreground flex items-center gap-1.5 h-12">
                          <Users className="h-3.5 w-3.5 text-primary" />{" "}
                          {v.studentCount} students
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold py-0 px-2 uppercase tracking-tighter bg-accent/20 border-accent/20"
                          >
                            {v.gradeLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] font-bold text-primary flex items-center h-12 gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {v.preferredDate}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusBadge[v.status]} border text-[10px] font-bold py-0 px-2 shadow-none capitalize`}
                          >
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <SchoolVisitActions
                            visit={v}
                            onStatusChange={handleVisitStatusChange}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {hasFetchError && (
        <div className="rounded-md border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">
          Some education data could not be loaded from backend. Programs,
          enrollments, or school visits endpoint may be unavailable.
        </div>
      )}

      {!isLoadingAny && programRows.length === 0 && (
        <div className="rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
          No training programs returned by backend.
        </div>
      )}
    </div>
  );
}
