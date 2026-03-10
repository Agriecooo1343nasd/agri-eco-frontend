"use client";

import { useParams, useRouter } from "next/navigation";
import { trainingPrograms } from "@/data/education";
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

// Mock enrollment data
const mockEnrollments = [
  {
    id: "e1",
    name: "Jean Mugabo",
    email: "jean@example.com",
    enrolledAt: "2026-03-01",
    progress: 75,
    status: "active" as const,
    completedModules: 3,
  },
  {
    id: "e2",
    name: "Marie Uwase",
    email: "marie@example.com",
    enrolledAt: "2026-03-02",
    progress: 100,
    status: "completed" as const,
    completedModules: 4,
  },
  {
    id: "e3",
    name: "Patrick Niyonzima",
    email: "patrick@example.com",
    enrolledAt: "2026-03-03",
    progress: 50,
    status: "active" as const,
    completedModules: 2,
  },
  {
    id: "e4",
    name: "Diane Mukamana",
    email: "diane@example.com",
    enrolledAt: "2026-03-04",
    progress: 25,
    status: "active" as const,
    completedModules: 1,
  },
  {
    id: "e5",
    name: "Emmanuel Habimana",
    email: "emmanuel@example.com",
    enrolledAt: "2026-03-05",
    progress: 0,
    status: "dropped" as const,
    completedModules: 0,
  },
];

export default function Page() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params.id || "";
  const program = trainingPrograms.find((p) => p.id === id);

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

  const completionRate = Math.round(
    (mockEnrollments.filter((e) => e.status === "completed").length /
      mockEnrollments.length) *
      100,
  );
  const activeStudents = mockEnrollments.filter(
    (e) => e.status === "active",
  ).length;
  const droppedStudents = mockEnrollments.filter(
    (e) => e.status === "dropped",
  ).length;
  const avgProgress = Math.round(
    mockEnrollments.reduce((s, e) => s + e.progress, 0) /
      mockEnrollments.length,
  );

  const statusColor: Record<string, string> = {
    active: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    dropped: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
          <p className="text-sm text-muted-foreground">
            Program Statistics & Enrollment Analytics
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Enrolled",
            value: program.enrolled,
            max: program.maxParticipants,
            icon: Users,
            color: "text-primary",
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
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              {s.max && (
                <span className="text-xs text-muted-foreground">/ {s.max}</span>
              )}
            </div>
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
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
              {program.duration.en}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium text-foreground">
              {program.startDate.en}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Modules</p>
            <p className="text-sm font-medium text-foreground">
              {program.modules.length} modules ·{" "}
              {program.modules.reduce((s, m) => s + m.contentBlocks.length, 0)}{" "}
              content blocks
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
                {mockEnrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <p className="font-medium text-foreground text-sm">
                        {e.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{e.enrolledAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-border rounded-full overflow-hidden w-20">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${e.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {e.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {e.completedModules} / {program.modules.length}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColor[e.status]} border text-xs capitalize`}
                      >
                        {e.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <div className="space-y-3">
            {program.modules.map((mod, i) => {
              const completedCount = mockEnrollments.filter(
                (e) => e.completedModules > i,
              ).length;
              const percentage = Math.round(
                (completedCount / mockEnrollments.length) * 100,
              );
              return (
                <div
                  key={mod.id}
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {mod.title.en}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mod.duration.en} · {mod.contentBlocks.length} blocks
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {percentage}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {completedCount}/{mockEnrollments.length} completed
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
