"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { 
  fetchAdminEnrollments, 
  updateAdminEnrollmentStatus,
  fetchAdminTrainingProgramById
} from "@/lib/api/education";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  completed: <BookOpen className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
};

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50",
  approved: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50",
  completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50",
  rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50",
};

export default function AdminEnrollments() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // 1. Fetch the Program Details so we can display the title
  const { data: program } = useQuery({
    queryKey: ["adminTrainingProgram", id],
    queryFn: () => fetchAdminTrainingProgramById(id as string),
    enabled: !!id,
  });

  const titleText = program?.title 
    ? typeof program.title === "string" 
      ? program.title 
      : (program.title as any).en || "Program"
    : "Program";

  // 2. Fetch the Enrollments specific to this program
  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ["adminEnrollments", id, page, statusFilter, searchQuery],
    queryFn: () => fetchAdminEnrollments({
      trainingProgramId: id,
      page,
      limit,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }),
    enabled: !!id,
  });

  // Mutate Enrollment Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: string }) => 
      updateAdminEnrollmentStatus(enrollmentId, { status }),
    onSuccess: () => {
      toast.success("Enrollment status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminEnrollments", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update enrollment status");
    }
  });

  const enrollments = enrollmentsData?.data || [];
  
  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => router.push("/admin/education")}
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <span>Back to Education Hub</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {titleText} Enrollments
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Manage students, approve requests, and review learning progress.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 h-10 w-full bg-background border-border focus-visible:ring-primary/20 text-xs shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] h-10 bg-background text-xs shadow-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 outline-none border-border">
                <TableHead className="font-bold text-foreground h-11 text-xs px-4">Student Info</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs">Contact</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs text-center">Progress</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs">Enrolled Date</TableHead>
                <TableHead className="font-bold text-foreground h-11 text-xs">Status</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 opacity-60">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
                    Loading enrollments...
                  </TableCell>
                </TableRow>
              ) : enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 opacity-60">
                    No enrollments found for this program.
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map((e: any) => (
                  <TableRow key={e.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4">
                      <p className="font-bold text-foreground mb-0.5">{e.fullName}</p>
                      {e.notes && (
                        <p className="text-[10px] text-muted-foreground w-[200px] truncate" title={e.notes}>
                          Note: {e.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[150px]">{e.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{e.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-foreground mb-1 text-center">
                          {e.completionPercentage || 0}%
                        </span>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden w-20 border border-border">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${e.completionPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Calendar className="h-3 w-3" />
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusBadge[e.status.toLowerCase()]} border py-0 px-2 font-bold shadow-none flex items-center gap-1 w-max`}
                      >
                        {statusIcon[e.status.toLowerCase()]}
                        {statusLabel[e.status.toLowerCase()] || e.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuLabel className="text-xs font-semibold py-1.5">Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-xs py-2 cursor-pointer gap-2"
                            onClick={() => updateStatusMutation.mutate({ enrollmentId: e.id, status: "approved" })}
                            disabled={e.status === "approved" || updateStatusMutation.isPending}
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-blue-500" /> Approve Access
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-xs py-2 cursor-pointer gap-2"
                            onClick={() => updateStatusMutation.mutate({ enrollmentId: e.id, status: "pending" })}
                            disabled={e.status === "pending" || updateStatusMutation.isPending}
                          >
                            <Clock className="h-3.5 w-3.5 text-yellow-500" /> Mark Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
                            onClick={() => updateStatusMutation.mutate({ enrollmentId: e.id, status: "rejected" })}
                            disabled={e.status === "rejected" || updateStatusMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination placeholder */}
        {enrollmentsData?.pagination && enrollmentsData.pagination.pages > 1 && (
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-medium bg-muted/10">
            <div>
              Showing page {page} of {enrollmentsData.pagination.pages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px]"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px]"
                disabled={page >= enrollmentsData.pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
