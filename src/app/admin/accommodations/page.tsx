"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Home,
  Users,
  DollarSign,
  Tag,
  ChevronRight,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  accommodations,
  AccommodationType,
  AccommodationStatus,
} from "@/data/accommodations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminAccommodationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccommodationStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<AccommodationType | "all">(
    "all",
  );

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch = acc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    const matchesType = typeFilter === "all" || acc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (id: string, name: string) => {
    toast.success(`Accommodation "${name}" deleted successfully (mock)`);
  };

  const statusColors: Record<AccommodationStatus, string> = {
    available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    occupied: "bg-green-500/10 text-green-600 border-green-500/20",
    hidden: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  const typeIcons: Record<AccommodationType, any> = {
    standard: Home,
    premium: Tag,
    family: Users,
    "eco-lodge": Home,
    campsite: Home,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <Home className="h-3 w-3" />
            <span>Management</span>
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Stay Options
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Manage your on-site accommodations, pricing, and availability
            status.
          </p>
        </div>
        <Link href="/admin/accommodations/create">
          <Button className="h-11 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold gap-2">
            <Plus className="h-5 w-5" />
            <span>Add New Stay</span>
          </Button>
        </Link>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Units",
            value: accommodations.length,
            icon: Home,
            color: "text-green-600",
          },
          {
            label: "Available",
            value: accommodations.filter((a) => a.status === "available")
              .length,
            icon: Check,
            color: "text-emerald-600",
          },
          {
            label: "Maintenance",
            value: accommodations.filter((a) => a.status === "maintenance")
              .length,
            icon: Trash2,
            color: "text-amber-600",
          },
          {
            label: "Revenue Portf.",
            value: "2.4M",
            icon: DollarSign,
            color: "text-primary",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={cn(
                  "p-2.5 rounded-xl bg-background border border-border/50 shadow-sm",
                  stat.color,
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-foreground leading-tight">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and List */}
      <Card className="border-border/50 shadow-sm overflow-hidden bg-card/30 backdrop-blur-sm">
        <CardHeader className="p-6 bg-muted/20 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stay name..."
                className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                className="h-11 px-4 text-sm rounded-xl border-border/50 bg-background/50 focus:ring-1 focus:ring-primary outline-none transition-all"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="family">Family</option>
                <option value="eco-lodge">Eco Lodge</option>
              </select>

              <select
                className="h-11 px-4 text-sm rounded-xl border-border/50 bg-background/50 focus:ring-1 focus:ring-primary outline-none transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="occupied">Occupied</option>
              </select>

              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl border-border/50 px-4"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-border/50">
                  <th className="p-4 pl-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Properties
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Rate (RWF)
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                    Capacity
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="p-4 pr-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredAccommodations.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 rounded-lg bg-muted border border-border/50 overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                          {acc.images[0] ? (
                            <img
                              src={acc.images[0]}
                              alt={acc.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Home className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {acc.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            ID: {acc.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/5 text-primary border border-primary/10">
                          {(() => {
                            const Icon = typeIcons[acc.type] || Home;
                            return <Icon className="h-3.5 w-3.5" />;
                          })()}
                        </div>
                        <span className="text-sm font-medium capitalize">
                          {acc.type.replace("-", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-sm">
                      {acc.pricePerNight.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        variant="outline"
                        className="rounded-full px-3 py-0 h-6 text-xs bg-muted/30 border-border/50 font-medium"
                      >
                        {acc.capacity} Pers.
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          "px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                          statusColors[acc.status],
                        )}
                      >
                        {acc.status}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/accommodations/${acc.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/accommodations/${acc.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => handleDelete(acc.id, acc.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-end group-hover:hidden text-muted-foreground/30">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAccommodations.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4 shadow-inner">
                <Home className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold">No stay options found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                We couldn't find any accommodations matching your current search
                or filter criteria.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-xl border-primary text-primary hover:bg-primary/5"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policy Reminder */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-green-100 bg-green-50/50 text-green-800">
        <div className="p-2 rounded-lg bg-white shadow-sm">
          <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wider">
          Pro-Tip: Linked accommodations will automatically appear on their
          respective tour detail pages for faster booking.
        </p>
      </div>
    </div>
  );
}
