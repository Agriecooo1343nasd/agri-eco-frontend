"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
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
import type { PartnerApplication } from "@/data/community";
import { getPartnerApplications } from "@/lib/partner-store";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PartnerApplicationsPage() {
  const [search, setSearch] = useState("");
  const [applications] = useState<PartnerApplication[]>(() =>
    getPartnerApplications(),
  );

  const filtered = useMemo(
    () =>
      applications.filter(
        (application) =>
          !search ||
          application.businessName
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          application.contactPerson
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          application.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [applications, search],
  );

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

      <Input
        className="max-w-sm h-9 text-xs"
        placeholder="Search applications"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
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
              {filtered.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <p className="font-semibold text-xs">
                      {application.businessName}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {application.aboutBusiness}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{application.contactPerson}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {application.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs capitalize">
                    {application.type}
                  </TableCell>
                  <TableCell className="text-xs">
                    {application.appliedDate}
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
        </div>
      </div>
    </div>
  );
}
