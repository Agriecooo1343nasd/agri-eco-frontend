"use client";

import { useState, useMemo } from "react";
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

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Super Admin";
  status: "Joined" | "Pending";
  invitedDate: string;
}

const initialMembers: Member[] = [
  {
    id: "MEM-001",
    name: "Aime Ndahiro",
    email: "aime.n@agrieco.com",
    phone: "+250 788 123 456",
    role: "Super Admin",
    status: "Joined",
    invitedDate: "Jan 10, 2024",
  },
  {
    id: "MEM-002",
    name: "Divine Uwera",
    email: "divine.u@agrieco.com",
    phone: "+250 788 654 321",
    role: "Admin",
    status: "Joined",
    invitedDate: "Feb 15, 2024",
  },
  {
    id: "MEM-003",
    name: "Kevin Mugisha",
    email: "kevin.m@gmail.com",
    phone: "+250 783 000 111",
    role: "Admin",
    status: "Pending",
    invitedDate: "March 01, 2024",
  },
];

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const filteredMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [members, searchQuery]);

  const handleInvite = () => {
    if (!newMember.name || !newMember.email || !newMember.phone) {
      toast.error("Missing Fields", {
        description: "Please fill in all details to send an invitation.",
      });
      return;
    }
    const invitation: Member = {
      id: `MEM-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: "Admin",
      status: "Pending",
      invitedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };
    setMembers((prev) => [invitation, ...prev]);
    toast.success("Invitation Sent", {
      description: `An invite has been dispatched to ${newMember.email}.`,
    });
    setNewMember({ name: "", email: "", phone: "" });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const member = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success(
      member?.status === "Pending" ? "Invitation Revoked" : "Member Removed",
      { description: `Data for ${member?.name} has been deleted.` },
    );
  };

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
        <Button
          onClick={() => setIsDialogOpen(true)}
        >
          <UserPlus className="h-5 w-5" /> Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Team",
            value: members.length,
            icon: Users,
          },
          {
            label: "Joined",
            value: members.filter((m) => m.status === "Joined").length,
            icon: CheckCircle2,
          },
          {
            label: "Pending Invited",
            value: members.filter((m) => m.status === "Pending").length,
            icon: Clock,
          },
        ].map((stat, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  {stat.label}
                </p>
                <p className="text-xl font-black text-foreground">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
          <Input
            placeholder="Search team members by name or email..."
            className="pl-12 h-14 rounded-2xl border-none bg-muted/20 focus:bg-white focus:ring-4 focus:ring-primary/5 font-bold text-base transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Members Table */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
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
                  Date Invited
                </TableHead>
                <TableHead className="w-[100px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-border group hover:bg-muted/5 transition-colors"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-muted-foreground text-lg group-hover:bg-primary group-hover:text-white transition-all">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black text-foreground font-heading leading-tight">
                          {member.name}
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
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-lg font-black text-[9px] uppercase tracking-wider py-1 px-3",
                        member.role === "Super Admin"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {member.role === "Super Admin" && (
                        <ShieldCheck className="h-3 w-3 mr-1 inline" />
                      )}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    <Badge
                      className={cn(
                        "rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                        member.status === "Joined"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white",
                      )}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center text-sm font-bold text-muted-foreground">
                    {member.invitedDate}
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
                        {member.status === "Pending" && (
                          <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold gap-2">
                            <Send className="h-4 w-4" /> Resend Invite
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />{" "}
                          {member.status === "Pending"
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
        </CardContent>
      </Card>

      {filteredMembers.length === 0 && (
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
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                  Full Name*
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter their full name"
                    className="pl-10 rounded-xl border-border h-12 transition-all focus:ring-primary/20 font-bold"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                  Phone Number*
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="+250 78x xxx xxx"
                    className="pl-10 rounded-xl border-border h-12 transition-all"
                    value={newMember.phone}
                    onChange={(e) =>
                      setNewMember({ ...newMember, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/5 border-t border-border mt-0 sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
            >
              <Send className="h-4 w-4" /> Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
