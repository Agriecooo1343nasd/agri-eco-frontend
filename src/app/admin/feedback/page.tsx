"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MessageCircle,
  Star,
  Search,
  Eye,
  Trash2,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  rating: number;
  message: string;
  status: "new" | "reviewed" | "archived";
  submittedAt: string;
}

const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    name: "Alice Mukamana",
    email: "alice@email.com",
    phone: "+250 788 111 222",
    type: "Compliment",
    rating: 5,
    message:
      "Amazing platform! I love the organic products selection and the ease of ordering. The delivery was prompt and the quality was excellent.",
    status: "new",
    submittedAt: "2025-01-20",
  },
  {
    id: "2",
    name: "Emmanuel Nshimiyimana",
    email: "emma@email.com",
    phone: "+250 788 333 444",
    type: "Feature Request",
    rating: 4,
    message:
      "It would be great to have a mobile app version. Also, adding more payment options like MTN MoMo would be very convenient for rural users.",
    status: "new",
    submittedAt: "2025-01-18",
  },
  {
    id: "3",
    name: "Grace Ingabire",
    email: "grace@email.com",
    phone: "",
    type: "Bug Report",
    rating: 3,
    message:
      "The checkout page sometimes freezes when selecting delivery location. This happens on both Chrome and Firefox browsers.",
    status: "reviewed",
    submittedAt: "2025-01-15",
  },
  {
    id: "4",
    name: "Patrick Habimana",
    email: "patrick@email.com",
    phone: "+250 788 555 666",
    type: "General",
    rating: 4,
    message:
      "Good platform overall. The farm tours are a unique addition. Would love to see more educational content about sustainable farming.",
    status: "reviewed",
    submittedAt: "2025-01-10",
  },
  {
    id: "5",
    name: "Diane Uwera",
    email: "diane@email.com",
    phone: "",
    type: "Complaint",
    rating: 2,
    message:
      "My order arrived late and some items were damaged. I expect better packaging for organic products. Please improve your logistics.",
    status: "archived",
    submittedAt: "2025-01-05",
  },
];

const typeColors: Record<string, string> = {
  Compliment: "bg-primary/10 text-primary border-primary/20",
  "Feature Request": "bg-green-500/10 text-green-600 border-green-500/20",
  "Bug Report": "bg-destructive/10 text-destructive border-destructive/20",
  General: "bg-muted text-muted-foreground border-border",
  Complaint: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const statusConfig: Record<string, { icon: any; color: string }> = {
  new: {
    icon: Clock,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  reviewed: {
    icon: CheckCircle,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  archived: {
    icon: Archive,
    color: "bg-muted text-muted-foreground border-border",
  },
};

export default function FeedbackManagementPage() {
  const [feedbackList, setFeedbackList] = useState(mockFeedback);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  const filtered = feedbackList.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: "reviewed" | "archived") => {
    setFeedbackList(
      feedbackList.map((f) => (f.id === id ? { ...f, status } : f)),
    );
    toast.success(`Feedback marked as ${status}`);
  };

  const deleteFeedback = (id: string) => {
    setFeedbackList(feedbackList.filter((f) => f.id !== id));
    toast.success("Feedback deleted");
  };

  const newCount = feedbackList.filter((f) => f.status === "new").length;
  const avgRating = feedbackList.length
    ? (
        feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length
      ).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            User Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {feedbackList.length} total · {newCount} new
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1.5 rounded-lg">
            <Star className="h-4 w-4 fill-secondary text-secondary" />
            <span className="font-bold text-sm text-foreground">
              {avgRating}
            </span>
            <span className="text-xs text-muted-foreground">avg</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback..."
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.status === "new" ? "bg-green-500/5" : ""}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.submittedAt}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${typeColors[item.type] || ""}`}
                    >
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < item.rating
                              ? "fill-secondary text-secondary"
                              : "text-border",
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.message}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusConfig[item.status]?.color}`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => deleteFeedback(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Review submitted feedback from a user.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {selectedItem.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedItem.email}
                    </span>
                    {selectedItem.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedItem.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${typeColors[selectedItem.type]}`}
                >
                  {selectedItem.type}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < selectedItem.rating
                        ? "fill-secondary text-secondary"
                        : "text-border",
                    )}
                  />
                ))}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedItem.message}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Submitted on {selectedItem.submittedAt}
              </p>

              <div className="flex gap-2">
                {selectedItem.status === "new" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      updateStatus(selectedItem.id, "reviewed");
                      setSelectedItem(null);
                    }}
                    className="gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Mark as Reviewed
                  </Button>
                )}
                {selectedItem.status !== "archived" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateStatus(selectedItem.id, "archived");
                      setSelectedItem(null);
                    }}
                    className="gap-1"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
