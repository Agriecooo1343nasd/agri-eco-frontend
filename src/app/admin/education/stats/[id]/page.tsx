"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  BarChart3,
  CheckCircle,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminTrainingProgramById,
  fetchAdminTrainingEnrollments,
} from "@/lib/api/education";
import { useLanguage } from "@/context/LanguageContext";

export default function Page() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params.id || "";
  const { t } = useLanguage();

  const { data: program, isLoading: isLoadingProgram } = useQuery({
    queryKey: ["admin", "training-program", id],
    queryFn: () => fetchAdminTrainingProgramById(id),
    enabled: !!id,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin", "training-stats", id],
    queryFn: () => {
      const { fetchAdminProgramStats } = require("@/lib/api/education");
      return fetchAdminProgramStats(id);
    },
    enabled: !!id,
  });

  const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["admin", "training-enrollments", id],
    queryFn: () =>
      fetchAdminTrainingEnrollments({ trainingProgramId: id, limit: 100 }),
    enabled: !!id,
  });

  if (isLoadingProgram || isLoadingEnrollments || isLoadingStats) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Program not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/education")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const enrollments = enrollmentsData?.data || [];

  const completionRate =
    enrollments.length > 0
      ? Math.round(
          (enrollments.filter((e: any) => e.status === "completed").length /
            enrollments.length) *
            100,
        )
      : 0;

  const activeStudents = enrollments.filter(
    (e: any) => e.status === "approved",
  ).length;

  // Since backend doesn't track granular progress yet,
  // we use status as a proxy: Completed = 100%, Approved = 50%, Pending/Rejected = 0%
  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((s: number, e: any) => {
            if (e.status === "completed") return s + 100;
            if (e.status === "approved") return s + 50;
            return s;
          }, 0) / enrollments.length,
        )
      : 0;

  const statusColor: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/education")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {program.title.en}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Program Statistics & Enrollment Analytics
          </p>
        </div>
        <Button variant="outline" className="gap-2 h-9 text-xs">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total Enrolled",
            value: stats?.enrollments?.total || enrollments.length,
            max: program.capacity,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Revenue (RWF)",
            value: (stats?.revenue || 0).toLocaleString(),
            icon: TrendingUp,
            color: "text-emerald-600",
          },
          {
            label: "Active Students",
            value: activeStudents,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: Award,
            color: "text-emerald-600",
          },
          {
            label: "Avg. Progress",
            value: `${avgProgress}%`,
            icon: TrendingUp,
            color: "text-secondary-foreground",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              {s.max && (
                <span className="text-[10px] font-bold text-muted-foreground">
                  LIMIT: {s.max}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground font-heading">
              {s.value}
            </p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Program Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-medium text-foreground">
              {program.durationWeeks
                ? `${program.durationWeeks} Weeks`
                : "Self-paced"}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium text-foreground">
              {program.startDate
                ? new Date(program.startDate).toLocaleDateString()
                : "TBD"}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Curriculum</p>
            <p className="text-sm font-medium text-foreground">
              {program.curriculum?.length || 0} Modules ·{" "}
              {program.curriculum?.reduce(
                (s: number, m: any) => s + (m.contentBlocks?.length || 0),
                0,
              ) || 0}{" "}
              Content Blocks
            </p>
          </div>
        </div>
      </div>

      {/* Module Progress & Enrollments */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="modules">Module Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Student</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Completed Modules</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e: any) => {
                  // Use real progress if available, fallback to status proxy
                  const progress =
                    typeof e.completionPercentage === "number"
                      ? e.completionPercentage
                      : e.status === "completed"
                        ? 100
                        : e.status === "approved"
                          ? 50
                          : 0;
                  const completedModules = Array.isArray(e.moduleProgress)
                    ? e.moduleProgress.filter((m: any) => m.completed).length
                    : e.status === "completed"
                      ? program.curriculum?.length || 0
                      : 0;

                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <p className="font-medium text-foreground text-sm">
                          {e.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.email}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-border rounded-full overflow-hidden w-20">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {completedModules} / {program.curriculum?.length || 0}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColor[e.status] || "bg-muted text-muted-foreground"} border text-xs capitalize`}
                        >
                          {e.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <div className="space-y-3">
            {(program.curriculum || []).map((mod: any, i: number) => {
              const completedCount = enrollments.filter(
                (e: any) => e.status === "completed",
              ).length;
              const percentage =
                enrollments.length > 0
                  ? Math.round((completedCount / enrollments.length) * 100)
                  : 0;
              return (
                <div
                  key={mod.id || i}
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {t(mod.title)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mod.durationWeeks
                        ? `${mod.durationWeeks} Weeks`
                        : "Self-paced"}{" "}
                      · {mod.contentBlocks?.length || 0} blocks
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {percentage}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {completedCount}/{enrollments.length} completed
                      </p>
                    </div>
                    <div
                      className="h-10 w-10 rounded-full border-[3px] flex items-center justify-center"
                      style={{
                        borderColor:
                          percentage === 100
                            ? "hsl(var(--primary))"
                            : "hsl(var(--border))",
                      }}
                    >
                      {percentage === 100 ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <span className="text-xs font-bold text-foreground">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
