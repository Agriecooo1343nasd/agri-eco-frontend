"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Mail,
  Phone,
  UserPlus,
  Users,
  ShieldCheck,
  X,
  CheckCircle2,
  Clock,
  Send,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  fetchTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  resendTeamInvite,
  fetchTeamStats,
  type FetchTeamMembersParams,
  type TeamMember,
} from "@/lib/api/team";

const roleColors: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700 border-rose-200",
  staff: "bg-violet-100 text-violet-700 border-violet-200",
  manager: "bg-primary/10 text-primary border-primary/20",
  delivery_agent: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const statusColors: Record<string, string> = {
  active: "bg-green-700 text-white",
  invited: "bg-amber-500 text-white",
  inactive: "bg-red-700 text-white",
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminMembers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "member" as const,
    position: "",
  });

  const params: FetchTeamMembersParams = {
    page,
    limit: 10,
    search: search.trim() || undefined,
    sort: "createdAt",
    order: "desc",
  };

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["team-members", params],
    queryFn: () => fetchTeamMembers(params),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["team-stats"],
    queryFn: () => fetchTeamStats(),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteTeamMember({
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        role: newMember.role as any,
        position: newMember.position || undefined,
      }),
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to send invitation";
      toast.error(message);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-stats"] });

      toast.success("Invitation Sent", {
        description: `An invite has been dispatched to ${result.email}.`,
      });

      setNewMember({
        firstName: "",
        lastName: "",
        email: "",
        role: "member",
        position: "",
      });
      setIsDialogOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeTeamMember(memberId),
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to remove member";
      toast.error(message);
    },
    onSuccess: (_, memberId) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-stats"] });

      const member = membersData?.data.find((m) => m.id === memberId);
      toast.success(
        member?.status === "invited" ? "Invitation Revoked" : "Member Removed",
        {
          description: `${member?.firstName || "Team member"} has been removed.`,
        },
      );
    },
  });

  const resendMutation = useMutation({
    mutationFn: (memberId: string) => resendTeamInvite(memberId),
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to resend invite";
      toast.error(message);
    },
    onSuccess: (result) => {
      toast.success("Invitation Resent", {
        description: `Invite resent to ${result.email}.`,
      });
    },
  });

  const handleInvite = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      toast.error("Missing Required Fields", {
        description: "Please fill in first name, last name, and email.",
      });
      return;
    }

    inviteMutation.mutate();
  };

  if (membersError) {
    toast.error("Failed to load team members");
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Team & Members
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Manage your administrative team and system collaborators.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="h-5 w-5" /> Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Team",
            value: statsData?.total ?? 0,
            icon: Users,
            loading: statsLoading,
          },
          {
            label: "Active",
            value: statsData?.active ?? 0,
            icon: CheckCircle2,
            loading: statsLoading,
          },
          {
            label: "Pending Invited",
            value: statsData?.invited ?? 0,
            icon: Clock,
            loading: statsLoading,
          },
        ].map((stat, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-sm bg-muted/30 flex items-center justify-center text-muted-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  {stat.label}
                </p>
                <p className="text-xl font-black text-foreground">
                  {stat.loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <div className=" p-4 rounded-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
          <Input
            placeholder="Search team members by name or email..."
            className="pl-12 h-14 rounded-sm border-none bg-muted/20 focus:bg-white focus:ring-4 focus:ring-primary/5 font-bold text-base transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Members Table */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          {membersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : membersData?.data.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                No team members found
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Member
                    </TableHead>
                    <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                      Contact
                    </TableHead>
                    <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                      Role
                    </TableHead>
                    <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                      Joined
                    </TableHead>
                    <TableHead className="w-[100px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersData?.data.map((member) => (
                    <TableRow
                      key={member.id}
                      className="border-border group hover:bg-muted/5 transition-colors"
                    >
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-muted-foreground text-lg group-hover:bg-primary group-hover:text-white transition-all">
                            {member.firstName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-black text-foreground font-heading leading-tight">
                              {member.firstName} {member.lastName}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                              {member.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Mail className="h-3 w-3 text-primary" />
                            {member.email}
                          </div>
                          {member.position && (
                            <div className="text-[10px] font-bold text-muted-foreground">
                              {member.position}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-lg font-black text-[9px] uppercase tracking-wider py-1 px-3",
                            roleColors[member.role] ||
                              "bg-muted text-muted-foreground border-border",
                          )}
                        >
                          {(member.role === "manager" || member.role === "staff" || member.role === "admin") && (
                            <ShieldCheck className="h-3 w-3 mr-1 inline" />
                          )}
                          {member.role.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <Badge
                          className={cn(
                            "rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                            statusColors[member.status] ||
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center text-sm font-bold text-muted-foreground">
                        {formatDate(member.joinedAt || member.createdAt)}
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[180px] rounded-2xl p-2 border-border"
                          >
                            {member.status === "invited" && (
                              <DropdownMenuItem
                                onClick={() => resendMutation.mutate(member.id)}
                                disabled={resendMutation.isPending}
                              >
                                <Send className="h-4 w-4" /> Resend Invite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => removeMutation.mutate(member.id)}
                              disabled={removeMutation.isPending}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />{" "}
                              {member.status === "invited"
                                ? "Revoke Invite"
                                : "Remove Member"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {membersData?.pagination && (
                <div className="border-t border-border px-4 py-3 flex items-center justify-between text-xs">
                  <p className="text-muted-foreground">
                    Page {membersData.pagination.page} of{" "}
                    {membersData.pagination.pages} (
                    {membersData.pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={
                        !membersData.pagination.hasPrev || membersLoading
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={
                        !membersData.pagination.hasNext || membersLoading
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!membersLoading && membersData?.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border border-dashed opacity-40">
          <Users className="h-16 w-16 mb-4 text-muted-foreground" />
          <p className="text-2xl font-black italic">No members found</p>
          <p className="text-sm font-medium">
            Try searching for a different name or email
          </p>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <div className="bg-primary p-8 text-white relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsDialogOpen(false)}
              disabled={inviteMutation.isPending}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-white/10">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black font-heading leading-tight">
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-white/70 font-medium">
              Send an administrative invitation to collaborate.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    First Name*
                  </label>
                  <Input
                    placeholder="First name"
                    className="rounded-xl border-border h-12 transition-all focus:ring-primary/20 font-bold"
                    value={newMember.firstName}
                    onChange={(e) =>
                      setNewMember({ ...newMember, firstName: e.target.value })
                    }
                    disabled={inviteMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    Last Name*
                  </label>
                  <Input
                    placeholder="Last name"
                    className="rounded-xl border-border h-12 transition-all focus:ring-primary/20 font-bold"
                    value={newMember.lastName}
                    onChange={(e) =>
                      setNewMember({ ...newMember, lastName: e.target.value })
                    }
                    disabled={inviteMutation.isPending}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                  Email Address*
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="name@agrieco.com"
                    className="pl-10 rounded-xl border-border h-12 transition-all focus:ring-primary/20 font-bold"
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    disabled={inviteMutation.isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    Role*
                  </label>
                  <select
                    className="w-full h-12 px-3 border border-border rounded-xl bg-background font-bold text-sm transition-all focus:ring-4 focus:ring-primary/5"
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        role: e.target.value as any,
                      })
                    }
                    disabled={inviteMutation.isPending}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="delivery_agent">Delivery Agent</option>
                    <option value="partner">Partner</option>
                    <option value="farmer">Farmer</option>
                    <option value="artisan">Artisan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    Position
                  </label>
                  <Input
                    placeholder="e.g., Team Lead"
                    className="rounded-xl border-border h-12 transition-all focus:ring-primary/20 font-bold"
                    value={newMember.position}
                    onChange={(e) =>
                      setNewMember({ ...newMember, position: e.target.value })
                    }
                    disabled={inviteMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/5 border-t border-border mt-0 sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {inviteMutation.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
