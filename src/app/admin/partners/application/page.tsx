"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  fetchAdminPartnerApplications,
  type FetchAdminPartnerApplicationsParams,
} from "@/lib/api/partners";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function PartnerApplicationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const params: FetchAdminPartnerApplicationsParams = {
    page,
    limit: 10,
    search: search.trim() || undefined,
    status:
      statusFilter && statusFilter !== "all"
        ? (statusFilter as any)
        : undefined,
    sort: "createdAt",
    order: "desc",
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-partner-applications", params],
    queryFn: () => fetchAdminPartnerApplications(params),
  });

  if (error) {
    toast.error("Failed to load applications");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/partners">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partners
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-heading mt-3">
            Partner Applications
          </h1>
          <p className="text-xs text-muted-foreground">
            Review incoming applications and open details for approval actions.
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input
          className="max-w-sm h-9 text-xs"
          placeholder="Search applications"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          className="h-9 text-xs px-3 border border-border rounded-md bg-background"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                No applications found
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Business
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Contact
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Type
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Applied
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <p className="font-semibold text-xs">
                          {application.businessName}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {application.description || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs">{application.contactName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {application.email}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs capitalize">
                        {application.businessType}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(application.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusBadge[application.status]} border text-[10px] capitalize`}
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          asChild
                        >
                          <Link
                            href={`/admin/partners/application/${application.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data?.pagination && (
                <div className="border-t border-border px-4 py-3 flex items-center justify-between text-xs">
                  <p className="text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.pages} (
                    {data.pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!data.pagination.hasPrev || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!data.pagination.hasNext || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
