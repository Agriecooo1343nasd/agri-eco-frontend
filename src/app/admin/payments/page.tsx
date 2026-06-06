"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  fetchAdminPayments,
  fetchAdminPaymentStats,
  type PaymentTransactionStatus,
} from "@/lib/api/payments";
import { usePricing } from "@/context/PricingContext";

const statusStyles: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  initiated: "bg-blue-100 text-blue-700 border-blue-200",
  refunded: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function AdminPaymentsPage() {
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentTransactionStatus | "all">("all");
  const [provider, setProvider] = useState<"mtn" | "airtel" | "all">("all");
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: fetchAdminPaymentStats,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", page, search, status, provider],
    queryFn: () =>
      fetchAdminPayments({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status,
        provider,
        sort: "createdAt",
        order: "desc",
      }),
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const pages = pagination?.pages ?? 1;

  const linkedType = (row: (typeof rows)[number]) => {
    if (row.orderId) return "Order";
    if (row.bookingId) return "Tour";
    if (row.trainingEnrollmentId) return "Education";
    if (row.schoolVisitId) return "School visit";
    return "—";
  };

  const linkedId = (row: (typeof rows)[number]) =>
    row.orderId ||
    row.bookingId ||
    row.trainingEnrollmentId ||
    row.schoolVisitId ||
    "—";

  const kpis = useMemo(
    () => [
      { label: "Total transactions", value: stats?.total ?? 0 },
      { label: "Successful", value: stats?.success ?? 0 },
      { label: "Pending", value: stats?.pending ?? 0 },
      { label: "Revenue (paid)", value: formatPrice(stats?.totalRevenue ?? 0) },
    ],
    [stats, formatPrice],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Payment Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Real ITEC Pay records for shop orders, tour bookings, and education enrollments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search reference, order, booking, enrollment…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="md:col-span-3">
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as PaymentTransactionStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select
                value={provider}
                onValueChange={(v) => {
                  setProvider(v as "mtn" | "airtel" | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  <SelectItem value="mtn">MTN</SelectItem>
                  <SelectItem value="airtel">Airtel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Loading payments…
                    </TableCell>
                  </TableRow>
                ) : rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {row.reference}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-medium">{linkedType(row)}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                            {linkedId(row)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="uppercase text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Smartphone className="h-3.5 w-3.5" />
                          {row.provider}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(row.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[row.status] ?? ""}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No payment records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pages}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(pages, p + 1));
                    }}
                    className={page >= pages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
