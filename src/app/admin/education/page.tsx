"use client";

import { useState } from "react";
import {
  trainingPrograms,
  sampleSchoolVisits,
  type SchoolVisit,
  type TrainingProgram,
} from "@/data/education";
import {
  GraduationCap,
  School,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { usePricing } from "@/context/PricingContext";

const statusBadge: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  full: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminEducationPage() {
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const activePrograms = trainingPrograms.filter(
    (p) => p.status === "open",
  ).length;
  const totalEnrolled = trainingPrograms.reduce((s, p) => s + p.enrolled, 0);
  const pendingVisits = sampleSchoolVisits.filter(
    (v) => v.status === "pending",
  ).length;
  const totalStudents = sampleSchoolVisits.reduce(
    (s, v) => s + v.studentCount,
    0,
  );

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
          onClick={() => setCreateDialogOpen(true)}
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
            color: "text-primary",
            bg: "bg-primary/5",
          },
          {
            label: "Total Enrolled",
            value: totalEnrolled,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Pending Visits",
            value: pendingVisits,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Total Students",
            value: totalStudents,
            icon: School,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3 border border-current/10`}
            >
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold font-heading text-foreground mb-0.5">
              {s.value}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
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
                  {trainingPrograms.map((p) => (
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
                          {p.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold capitalize text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                          {p.level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1 px-0.5">
                          <span>
                            {p.enrolled} / {p.maxParticipants}
                          </span>
                          <span className="text-muted-foreground opacity-70">
                            {Math.round((p.enrolled / p.maxParticipants) * 100)}
                            %
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden w-24 border border-border">
                          <div
                            className="h-full bg-primary rounded-full shadow-sm"
                            style={{
                              width: `${(p.enrolled / p.maxParticipants) * 100}%`,
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold text-foreground">
                        {p.startDate}
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-sm">
                        {formatPrice(p.price)}
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
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer">
                              <Eye className="h-3.5 w-3.5" />
                              View Stats
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer">
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
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
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
                  {sampleSchoolVisits.map((v) => (
                    <TableRow
                      key={v.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <p className="font-bold text-foreground text-[11px] mb-0.5">
                          {v.schoolName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold italic truncate max-w-[150px]">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() =>
                                toast.success("Visit Approved", {
                                  description: `${v.schoolName} visit scheduled for ${v.preferredDate}.`,
                                })
                              }
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-primary" />
                              Confirm Visit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer">
                              <Eye className="h-3.5 w-3.5" />
                              Full Request
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() =>
                                toast.error("Visit Declined", {
                                  description: `Invitation for ${v.schoolName} has been declined.`,
                                })
                              }
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Decline
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
      </Tabs>

      {/* Create Program Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading text-lg">
              Create Training Program
            </DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Define a new educational experience for the community.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Creation Successful", {
                description: "The new training program is now live.",
              });
              setCreateDialogOpen(false);
            }}
            className="space-y-5 pt-4"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Program Identity
              </Label>
              <Input
                required
                placeholder="e.g., Organic Farming Basics & Soils"
                className="text-xs h-10 shadow-sm border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Comprehensive Description
              </Label>
              <Textarea
                required
                placeholder="Highlight core learning objectives and impact..."
                className="text-xs min-h-[100px] shadow-sm border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Content Type
                </Label>
                <Select>
                  <SelectTrigger className="text-xs h-10 shadow-sm">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop" className="text-xs">
                      Workshop
                    </SelectItem>
                    <SelectItem value="course" className="text-xs">
                      Full Course
                    </SelectItem>
                    <SelectItem value="certification" className="text-xs">
                      Certification
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Complexity Level
                </Label>
                <Select>
                  <SelectTrigger className="text-xs h-10 shadow-sm">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner" className="text-xs">
                      Beginner Friendly
                    </SelectItem>
                    <SelectItem value="intermediate" className="text-xs">
                      Intermediate
                    </SelectItem>
                    <SelectItem value="advanced" className="text-xs">
                      Specialized/Advanced
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Enrollment Fee (RWF)
                </Label>
                <Input
                  type="number"
                  placeholder="50000"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Participant Cap
                </Label>
                <Input
                  type="number"
                  placeholder="30"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Session Duration
                </Label>
                <Input
                  placeholder="e.g., 4 weeks (Saturdays)"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Launch Date
                </Label>
                <Input
                  type="date"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
            </div>
            <DialogFooter className="border-t pt-5">
              <Button
                variant="outline"
                type="button"
                onClick={() => setCreateDialogOpen(false)}
                className="text-xs h-10 px-6 font-bold"
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="text-xs h-10 px-8 font-bold shadow-sm"
              >
                Publish Program
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
