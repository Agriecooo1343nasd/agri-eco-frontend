"use client";

import { useState, useMemo } from "react";
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
  Calendar,
  Filter,
  MapPin,
} from "lucide-react";
import { tours as allTours, type Tour } from "@/data/tours";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";

const statusBadge: Record<string, string> = {
  available: "bg-primary/10 text-primary border-primary/20",
  limited: "bg-amber-100 text-amber-700 border-amber-200",
  "sold-out": "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-muted text-muted-foreground border-border",
};

const categoryLabels: Record<string, string> = {
  "farm-tour": "Farm Tour",
  beekeeping: "Beekeeping",
  harvesting: "Harvesting",
  cultural: "Cultural",
  educational: "Educational",
  "farm-stay": "Farm Stay",
  workshop: "Workshop",
};

type SortKey = "name" | "price" | "rating" | "maxParticipants" | "createdAt";
type SortDir = "asc" | "desc";

export default function AdminToursPage() {
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return (
        <span className="inline-flex flex-col ml-1 opacity-30">
          <ArrowUp className="h-3 w-3" />
          <ArrowDown className="h-3 w-3 -mt-1" />
        </span>
      );
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline" />
    );
  };

  const filtered = useMemo(() => {
    let data = [...allTours];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      data = data.filter((t) => t.status === statusFilter);
    if (categoryFilter !== "all")
      data = data.filter((t) => t.category === categoryFilter);

    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "rating") cmp = a.rating - b.rating;
      else if (sortKey === "maxParticipants")
        cmp = a.maxParticipants - b.maxParticipants;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return data;
  }, [search, statusFilter, categoryFilter, sortKey, sortDir]);

  const totalSpots = (t: Tour) =>
    t.timeSlots.reduce((s, ts) => s + ts.capacity, 0);
  const bookedSpots = (t: Tour) =>
    t.timeSlots.reduce((s, ts) => s + ts.booked, 0);

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground uppercase tracking-tight">
            Tour Experience Catalog
          </h1>
          <p className="text-sm text-muted-foreground font-semibold opacity-80">
            {filtered.length} agritourism experiences active
          </p>
        </div>
        <Button
          className="gap-2 text-xs font-bold h-10 px-6 shadow-sm"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add New Experience
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-sm focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-[11px] bg-transparent outline-none font-bold placeholder:font-medium"
            placeholder="Search by name, tags, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 text-xs bg-background border-border shadow-none font-bold">
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
          <SelectTrigger className="w-40 h-9 text-xs bg-background border-border shadow-none font-bold">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Categories
            </SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-xs">
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-16 text-[10px] font-bold uppercase tracking-wider text-center">
                  Preview
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("name")}
                >
                  Experience Title <SortIcon col="name" />
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Category
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("price")}
                >
                  Price <SortIcon col="price" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("maxParticipants")}
                >
                  Capacity <SortIcon col="maxParticipants" />
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Market Occupancy
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("rating")}
                >
                  Rating <SortIcon col="rating" />
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Commercial Status
                </TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tour) => (
                <TableRow
                  key={tour.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="text-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border mx-auto shadow-sm">
                      <img
                        src={tour.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-foreground text-[11px] mb-0.5">
                      {tour.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {tour.duration}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold py-0 px-2 bg-muted/30 border-muted-foreground/20"
                    >
                      {categoryLabels[tour.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground text-[11px]">
                      {formatPrice(tour.price)}
                    </span>
                    {tour.groupPrice && (
                      <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-tight leading-none mt-0.5">
                        {formatPrice(tour.groupPrice)} (group)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />{" "}
                      {tour.maxParticipants}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <div className="flex justify-between text-[10px] font-bold mb-1 px-0.5">
                        <span>
                          {bookedSpots(tour)} / {totalSpots(tour)}
                        </span>
                        <span className="opacity-60">
                          {Math.round(
                            (bookedSpots(tour) / totalSpots(tour)) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                        <div
                          className="h-full bg-primary rounded-full shadow-sm"
                          style={{
                            width: `${(bookedSpots(tour) / totalSpots(tour)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                      {tour.rating}
                      <span className="text-[10px] text-muted-foreground opacity-70">
                        ({tour.reviewCount})
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusBadge[tour.status]} border text-[10px] font-bold py-0 px-2 shadow-none capitalize`}
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
                          className="gap-2 text-xs py-2 cursor-pointer"
                          onClick={() =>
                            toast.success(tour.name, {
                              description: "Viewing public experience page.",
                            })
                          }
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview Public
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs py-2 cursor-pointer"
                          onClick={() =>
                            toast.info(tour.name, {
                              description: "Editing mode activated.",
                            })
                          }
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Modify Experience
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() =>
                            toast.error("Experience Removed", {
                              description: tour.name + " deleted.",
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Forever
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

      {/* Create Experience Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3 text-left">
            <DialogTitle className="font-heading text-lg">
              Create New Experience
            </DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Add a unique agritourism tour or workshop to your catalog.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Experience Live", {
                description:
                  "The new experience has been published successfully.",
              });
              setCreateDialogOpen(false);
            }}
            className="space-y-5 pt-4"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Internal Catalog Name *
              </Label>
              <Input
                required
                placeholder="e.g., Morning Coffee Harvest & Brewing"
                className="text-xs h-10 shadow-sm border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Market-Facing Description *
              </Label>
              <Textarea
                required
                placeholder="Highlight the unique value proposition and itinerary..."
                className="text-xs min-h-[100px] shadow-sm border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Experience Category *
                </Label>
                <Select required>
                  <SelectTrigger className="text-xs h-10 shadow-sm">
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Standard Duration *
                </Label>
                <Input
                  required
                  placeholder="e.g., 3 hours (Flexible)"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Base Price (RWF) *
                </Label>
                <Input
                  type="number"
                  required
                  placeholder="25000"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Institutional/Group Price
                </Label>
                <Input
                  type="number"
                  placeholder="18000"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Operational Capacity *
                </Label>
                <Input
                  type="number"
                  required
                  placeholder="20 pax"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Min. Policy
                </Label>
                <Input
                  type="number"
                  placeholder="1 pax"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Initial Launch Status
                </Label>
                <Select>
                  <SelectTrigger className="text-xs h-10 shadow-sm">
                    <SelectValue placeholder="Initial Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available" className="text-xs">
                      Live / Available
                    </SelectItem>
                    <SelectItem value="limited" className="text-xs">
                      Limited Capacity
                    </SelectItem>
                    <SelectItem value="upcoming" className="text-xs">
                      Upcoming/Hidden
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Geo-Location / Point
                </Label>
                <Input
                  placeholder="Musanze District Hub"
                  className="text-xs h-10 shadow-sm border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Value Propositions (What's Included)
              </Label>
              <Textarea
                placeholder="Entry fees, Professional Guide, Lunch, etc. (Separate by commas)"
                className="text-xs shadow-sm border-border"
              />
            </div>
            <DialogFooter className="border-t pt-5">
              <Button
                variant="outline"
                type="button"
                onClick={() => setCreateDialogOpen(false)}
                className="text-xs h-10 px-6 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-xs h-10 px-8 font-bold shadow-sm"
              >
                Publish to Catalog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
