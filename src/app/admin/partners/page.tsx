"use client";

import { useState } from "react";
import { partners, type Partner } from "@/data/community";
import {
  Handshake,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Package,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
};

const typeBadge: Record<string, string> = {
  "tourism-operator": " Tourism",
  hotel: " Hotel",
  restaurant: " Restaurant",
  school: " School",
  ngo: " NGO",
};

export default function AdminPartnersPage() {
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const filtered = partners.filter(
    (p) =>
      !search ||
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(search.toLowerCase()),
  );

  const totalRevenue = partners.reduce((s, p) => s + p.totalRevenue, 0);
  const totalBookings = partners.reduce((s, p) => s + p.totalBookings, 0);

  return (
    <div className="space-y-6 text-xs font-medium">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Partners & Community Network
          </h1>
          <p className="text-sm text-muted-foreground font-semibold tracking-tight">
            {partners.length} registered institutional partners
          </p>
        </div>
        <Button className="gap-2 text-xs font-bold h-10 px-6 shadow-sm">
          <Plus className="h-4 w-4" /> Register New Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Partners",
            value: partners.filter((p) => p.status === "active").length,
            icon: Handshake,
          },
          {
            label: "Total Bookings",
            value: totalBookings,
            icon: Calendar,
          },
          {
            label: "Total Revenue",
            value: `${(totalRevenue / 1000000).toFixed(1)}M RWF`,
            icon: DollarSign,
          },
          {
            label: "Partner Packages",
            value: partners.reduce((s, p) => s + p.packages.length, 0),
            icon: Package,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 bg-muted/30 rounded-lg flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all`}
              >
                <s.icon
                  className={`h-5 w-5 text-muted-foreground group-hover:text-white transition-colors`}
                />
              </div>
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

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none font-medium"
            placeholder="Search by business or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Business Identity
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Classification
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Primary Contact
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Commission (%)
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">
                  Bookings
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Revenue Contribution
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Network Status
                </TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <p className="font-bold text-foreground text-[11px] mb-0.5">
                      {p.businessName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter italic">
                      Joined {p.joinedDate}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                      {typeBadge[p.type] || p.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-[11px] font-bold text-foreground mb-0.5">
                      {p.contactPerson}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium underline underline-offset-2">
                      {p.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-sm text-foreground">
                      {p.commissionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[11px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {p.totalBookings}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-foreground text-sm">
                    {formatPrice(p.totalRevenue)}
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
                          Partner Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer">
                          <Edit className="h-3.5 w-3.5" />
                          Modify Agreements
                        </DropdownMenuItem>
                        {p.status === "pending" && (
                          <DropdownMenuItem
                            className="gap-2 text-xs py-2 cursor-pointer"
                            onClick={() =>
                              toast.success("Partner Activated", {
                                description: `${p.businessName} is now active in the network.`,
                              })
                            }
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            Activate Partner
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() =>
                            toast.error("Partner Terminated", {
                              description: `Termination process for ${p.businessName} initiated.`,
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Terminate
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
    </div>
  );
}
