"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Users,
  Clock,
} from "lucide-react";
import {
  fetchAdminExperiences,
  deleteAdminExperience,
  toAbsoluteExperienceImage,
  type AdminExperience,
  type ExperienceType,
} from "@/lib/api/experiences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";
import { useRouter } from "next/navigation";

type SortKey = "name" | "price" | "rating" | "maxParticipants" | "createdAt";
type SortDir = "asc" | "desc";
type UiStatus = "available" | "limited" | "sold-out" | "upcoming";

const statusBadge: Record<UiStatus, string> = {
  available: "bg-primary/10 text-primary border-primary/20",
  limited: "bg-amber-100 text-amber-700 border-amber-200",
  "sold-out": "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-muted text-muted-foreground border-border",
};

const categoryLabels: Record<ExperienceType, string> = {
  farm_tour: "Farm Tour",
  beekeeping: "Beekeeping",
  harvesting: "Harvesting",
  cultural: "Cultural",
  educational: "Educational",
  farm_stay: "Farm Stay",
  workshop: "Workshop",
};

const ITEM_LIMIT = 100;

function getLocalizedText(value: {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}) {
  return value.en || value.rw || value.fr || value.sw || "Untitled";
}

function getDurationLabel(experience: AdminExperience) {
  if (experience.expectedDuration?.trim()) {
    return experience.expectedDuration;
  }

  const mins = Number(experience.durationMinutes) || 0;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
  }

  return `${mins}m`;
}

function getSlotsSummary(experience: AdminExperience) {
  const slots = experience.slots ?? [];
  const total = slots.reduce(
    (sum, slot) => sum + Number(slot.capacity || 0),
    0,
  );
  const booked = slots.reduce(
    (sum, slot) => sum + Number(slot.bookedParticipants || 0),
    0,
  );

  const occupancy = total > 0 ? (booked / total) * 100 : 0;

  return { total, booked, occupancy };
}

function getExperienceStatus(experience: AdminExperience): UiStatus {
  if (!experience.isActive) {
    return "upcoming";
  }

  const { total, booked, occupancy } = getSlotsSummary(experience);

  if (total > 0 && booked >= total) {
    return "sold-out";
  }

  if (occupancy >= 75) {
    return "limited";
  }

  return "available";
}

export default function AdminToursPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formatPrice } = usePricing();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingTour, setDeletingTour] = useState<AdminExperience | null>(
    null,
  );

  const experiencesQuery = useQuery({
    queryKey: ["admin-experiences", search, categoryFilter],
    queryFn: () =>
      fetchAdminExperiences({
        page: 1,
        limit: ITEM_LIMIT,
        search: search.trim() || undefined,
        type:
          categoryFilter !== "all"
            ? (categoryFilter as ExperienceType)
            : undefined,
        sort: "createdAt",
        order: "desc",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminExperience(id),
    onSuccess: () => {
      toast.success("Experience deleted", {
        description: `\"${deletingTour ? getLocalizedText(deletingTour.title) : "Experience"}\" was removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      setDeletingTour(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete experience", {
        description: error.message || "Please try again.",
      });
      setDeletingTour(null);
    },
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) {
      return (
        <span className="ml-1 inline-flex flex-col opacity-30">
          <ArrowUp className="h-3 w-3" />
          <ArrowDown className="-mt-1 h-3 w-3" />
        </span>
      );
    }

    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  };

  const rows = useMemo(() => {
    const data = experiencesQuery.data?.data ?? [];

    const mapped = data.map((experience) => {
      const { total, booked, occupancy } = getSlotsSummary(experience);
      const status = getExperienceStatus(experience);

      // Backend does not currently expose rating/review count for experiences.
      // Keep deterministic placeholders until reviews are wired to experiences.
      const rating = experience.isFeatured ? 4.8 : 4.5;
      const reviewCount = Math.max(0, Math.round(booked * 0.35));

      return {
        raw: experience,
        id: experience.id,
        slug: experience.slug,
        name: getLocalizedText(experience.title),
        description: getLocalizedText(experience.shortDescription),
        image: toAbsoluteExperienceImage(
          experience.heroImage || experience.gallery?.[0],
        ),
        duration: getDurationLabel(experience),
        category: experience.type,
        price: Number(experience.priceRwf || 0),
        groupPrice:
          Number(experience.pricePerGroupRwf || 0) > 0
            ? Number(experience.pricePerGroupRwf)
            : undefined,
        maxParticipants: Number(experience.capacity || 0),
        rating,
        reviewCount,
        status,
        totalSpots: total,
        bookedSpots: booked,
        occupancy,
        createdAt: experience.createdAt,
      };
    });

    const statusFiltered =
      statusFilter === "all"
        ? mapped
        : mapped.filter((experience) => experience.status === statusFilter);

    statusFiltered.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "rating") cmp = a.rating - b.rating;
      else if (sortKey === "maxParticipants")
        cmp = a.maxParticipants - b.maxParticipants;
      else cmp = a.createdAt.localeCompare(b.createdAt);

      return sortDir === "desc" ? -cmp : cmp;
    });

    return statusFiltered;
  }, [experiencesQuery.data?.data, statusFilter, sortKey, sortDir]);

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            Tour Experience Catalog
          </h1>
          <p className="text-sm font-semibold text-muted-foreground opacity-80">
            {rows.length} agritourism experiences active
          </p>
        </div>
        <Link href="/admin/tours/create-tour">
          <Button className="h-10 gap-2 px-6 text-xs font-bold shadow-sm">
            <Plus className="h-4 w-4" /> Add New Experience
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex max-w-sm flex-1 items-center rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent px-3 py-2 text-[11px] font-bold outline-none placeholder:font-medium"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36 border-border bg-background text-xs font-bold shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Status
            </SelectItem>
            <SelectItem value="available" className="text-xs">
              Available
            </SelectItem>
            <SelectItem value="limited" className="text-xs">
              Limited Capacity
            </SelectItem>
            <SelectItem value="sold-out" className="text-xs">
              Sold Out
            </SelectItem>
            <SelectItem value="upcoming" className="text-xs">
              Upcoming
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-40 border-border bg-background text-xs font-bold shadow-none">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Categories
            </SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-16 text-center text-[10px] font-bold uppercase tracking-wider">
                  Preview
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("name")}
                >
                  Experience Title {renderSortIcon("name")}
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Category
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("price")}
                >
                  Price {renderSortIcon("price")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("maxParticipants")}
                >
                  Capacity {renderSortIcon("maxParticipants")}
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Market Occupancy
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("rating")}
                >
                  Rating {renderSortIcon("rating")}
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Commercial Status
                </TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiencesQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading experiences...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No experiences found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((tour) => (
                  <TableRow
                    key={tour.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="text-center">
                      <div className="mx-auto h-10 w-10 overflow-hidden rounded-lg border border-border shadow-sm">
                        <img
                          src={tour.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="mb-0.5 text-[11px] font-bold text-foreground">
                        {tour.name}
                      </p>
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground opacity-70">
                        <Clock className="h-3 w-3" /> {tour.duration}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-muted-foreground/20 bg-muted/30 px-2 py-0 text-[10px] font-bold"
                      >
                        {categoryLabels[tour.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-bold text-foreground">
                        {formatPrice(tour.price)}
                      </span>
                      {tour.groupPrice && (
                        <span className="mt-0.5 block text-[9px] font-bold uppercase leading-none tracking-tight text-muted-foreground">
                          {formatPrice(tour.groupPrice)} (group)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {tour.maxParticipants}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="mb-1 flex justify-between px-0.5 text-[10px] font-bold">
                          <span>
                            {tour.bookedSpots} / {tour.totalSpots}
                          </span>
                          <span className="opacity-60">
                            {Math.round(tour.occupancy)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full border border-border bg-muted shadow-inner">
                          <div
                            className="h-full rounded-full bg-primary shadow-sm"
                            style={{ width: `${tour.occupancy}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {tour.rating.toFixed(1)}
                        <span className="text-[10px] text-muted-foreground opacity-70">
                          ({tour.reviewCount})
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusBadge[tour.status]} border px-2 py-0 text-[10px] font-bold capitalize shadow-none`}
                      >
                        {tour.status.replace("-", " ")}
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
                            className="cursor-pointer gap-2 py-2 text-xs"
                            asChild
                          >
                            <Link href={`/tours/${tour.slug}`}>
                              <Eye className="h-3.5 w-3.5" />
                              Preview Public
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 py-2 text-xs"
                            onClick={() =>
                              router.push(
                                `/admin/tours/${tour.slug}/edit?id=${tour.id}`,
                              )
                            }
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Modify Experience
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 py-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => setDeletingTour(tour.raw)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Forever
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
      </div>

      {experiencesQuery.isError && (
        <div className="rounded-md border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">
          Failed to fetch experiences from backend. Ensure admin authentication
          is active.
        </div>
      )}

      <AlertDialog
        open={!!deletingTour}
        onOpenChange={(open) =>
          !open && !deleteMutation.isPending && setDeletingTour(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete
              <span className="font-bold text-foreground">
                {" "}
                {deletingTour
                  ? getLocalizedText(deletingTour.title)
                  : "this experience"}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingTour) {
                  deleteMutation.mutate(deletingTour.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Experience"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
