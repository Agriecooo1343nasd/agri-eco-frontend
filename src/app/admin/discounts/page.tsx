"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Tag,
  Percent,
  Flame,
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Discount {
  id: string;
  name: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  type: "Percentage" | "BOGO";
  value?: string;
  dealType?: "New Deal" | "Hot Deal";
  status: "Active" | "Expired" | "Scheduled";
  limit: number;
  usedCount: number;
}

const initialDiscounts: Discount[] = [
  {
    id: "DSC-001",
    name: "Summer Organic Blast",
    description: "Huge discounts on all summer fruits and organic honey packs.",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=200&auto=format&fit=crop",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    type: "Percentage",
    value: "25%",
    dealType: "Hot Deal",
    status: "Active",
    limit: 500,
    usedCount: 342,
  },
  {
    id: "DSC-002",
    name: "Harvest Season BOGO",
    description:
      "Buy one naturally grown vegetable pack and get another one free.",
    image:
      "https://images.unsplash.com/photo-1595855759920-86582396706a?q=80&w=200&auto=format&fit=crop",
    startDate: "2024-09-01",
    endDate: "2024-10-31",
    type: "BOGO",
    value: "Buy 1 Get 1",
    dealType: "New Deal",
    status: "Scheduled",
    limit: 200,
    usedCount: 0,
  },
  {
    id: "DSC-003",
    name: "Flash Sale Friday",
    description: "Limited time offer on all juices and extracts.",
    image:
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=200&auto=format&fit=crop",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    type: "Percentage",
    value: "50%",
    dealType: "Hot Deal",
    status: "Expired",
    limit: 100,
    usedCount: 100,
  },
];

export default function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] =
    useState<Partial<Discount> | null>(null);

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        d.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [discounts, searchQuery, statusFilter]);

  const handleOpenDialog = (discount?: Discount) => {
    if (discount) {
      setCurrentDiscount(discount);
    } else {
      setCurrentDiscount({
        type: "Percentage",
        dealType: "New Deal",
        limit: 100,
        usedCount: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentDiscount?.name || !currentDiscount?.description) {
      toast.error("Missing Fields", {
        description: "Please fill in all required fields.",
      });
      return;
    }
    if (currentDiscount.id) {
      setDiscounts((prev) =>
        prev.map((d) =>
          d.id === currentDiscount.id ? (currentDiscount as Discount) : d,
        ),
      );
      toast.success("Discount Updated", {
        description: `"${currentDiscount.name}" has been updated.`,
      });
    } else {
      const newDiscount: Discount = {
        ...(currentDiscount as Discount),
        id: `DSC-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        status: "Active",
      };
      setDiscounts((prev) => [newDiscount, ...prev]);
      toast.success("Discount Created", {
        description: `"${newDiscount.name}" is now available.`,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const d = discounts.find((x) => x.id === id);
    setDiscounts((prev) => prev.filter((x) => x.id !== id));
    toast.success("Discount Deleted", {
      description: d ? `"${d.name}" has been removed.` : "Discount removed.",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Discounts & Deals
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Create and manage promotional offers for your customers.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary text-white gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" /> New Discount
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[24px] border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Active Deals
                </p>
                <p className="text-2xl font-black">
                  {discounts.filter((d) => d.status === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Scheduled
                </p>
                <p className="text-2xl font-black">
                  {discounts.filter((d) => d.status === "Scheduled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Expired
                </p>
                <p className="text-2xl font-black">
                  {discounts.filter((d) => d.status === "Expired").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="bg-card p-6 rounded-[32px] border border-border">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative group w-full lg:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
            <Input
              placeholder="Search deals by name or keyword..."
              className="pl-12 h-14 rounded-2xl border-none bg-muted/20 focus:bg-white focus:ring-4 focus:ring-primary/5 font-bold text-base transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full lg:w-auto gap-4">
            <div className="relative min-w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-none font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-xl">
                  <SelectItem value="all" className="font-bold">
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="active"
                    className="font-bold text-emerald-600"
                  >
                    Active Only
                  </SelectItem>
                  <SelectItem
                    value="scheduled"
                    className="font-bold text-amber-600"
                  >
                    Scheduled
                  </SelectItem>
                  <SelectItem
                    value="expired"
                    className="font-bold text-rose-600"
                  >
                    Expired
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="h-14 px-8 rounded-2xl border-2 border-muted hover:border-primary hover:text-primary font-bold text-sm transition-all flex items-center gap-2"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiscounts.map((discount) => (
          <Card
            key={discount.id}
            className="rounded-[32px] border-border overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={discount.image}
                alt={discount.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge
                  className={cn(
                    "rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-wider border-none shadow-lg",
                    discount.status === "Active"
                      ? "bg-emerald-500 text-white"
                      : discount.status === "Scheduled"
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {discount.status}
                </Badge>
                {discount.dealType && (
                  <Badge
                    className={cn(
                      "rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-wider border-none shadow-lg flex items-center gap-1",
                      discount.dealType === "Hot Deal"
                        ? "bg-rose-500 text-white"
                        : "bg-primary text-white",
                    )}
                  >
                    {discount.dealType === "Hot Deal" ? (
                      <Flame className="h-3 w-3" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    {discount.dealType}
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                    {discount.type}
                  </p>
                  <p className="text-white text-3xl font-black leading-none">
                    {discount.value}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-xl h-9 w-9 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black border-none"
                    onClick={() => handleOpenDialog(discount)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-xl h-9 w-9 border-none"
                    onClick={() => handleDelete(discount.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-black font-heading leading-tight">
                  {discount.name}
                </CardTitle>
                <div className="text-[10px] font-black text-muted-foreground uppercase opacity-50">
                  #{discount.id}
                </div>
              </div>
              <CardDescription className="line-clamp-2 mt-2 font-medium leading-relaxed">
                {discount.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 border-t border-border/50">
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    Valid From
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Calendar className="h-3 w-3 text-primary" />
                    {new Date(discount.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="h-6 w-px bg-border/50 mx-2" />
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    Usage Limit
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground justify-end">
                    <User className="h-3 w-3 text-primary" />
                    {discount.usedCount} / {discount.limit} Used
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    discount.usedCount / discount.limit > 0.8
                      ? "bg-rose-500"
                      : "bg-primary",
                  )}
                  style={{
                    width: `${Math.min(100, (discount.usedCount / discount.limit) * 100)}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiscounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-[32px] border border-border border-dashed opacity-40">
          <Tag className="h-16 w-16 mb-4 text-muted-foreground" />
          <p className="text-2xl font-black italic">No discounts found</p>
          <p className="text-sm font-medium">
            Try adjusting your search criteria
          </p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Tag className="h-6 w-6" />
            </div>
            <DialogTitle className="text-3xl font-black font-heading leading-tight">
              {currentDiscount?.id ? "Edit Discount" : "Create New Discount"}
            </DialogTitle>
            <DialogDescription className="text-white/70 font-medium">
              Configure the details of your promotional deal.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground">
                    Discount Name*
                  </label>
                  <Input
                    placeholder="e.g. Summer Blowout"
                    className="rounded-xl border-border h-11 transition-all focus:ring-primary/20"
                    value={currentDiscount?.name || ""}
                    onChange={(e) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground">
                    Deal Type
                  </label>
                  <Select
                    value={currentDiscount?.dealType}
                    onValueChange={(val: any) =>
                      setCurrentDiscount({ ...currentDiscount, dealType: val })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-border h-11 font-bold">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="New Deal">New Deal</SelectItem>
                      <SelectItem value="Hot Deal">Hot Deal</SelectItem>
                      <SelectItem value="none">No Special Tags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Description*
                </label>
                <Textarea
                  placeholder="Share some details about this deal..."
                  className="rounded-xl border-border min-h-[100px] transition-all focus:ring-primary/20"
                  value={currentDiscount?.description || ""}
                  onChange={(e) =>
                    setCurrentDiscount({
                      ...currentDiscount,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Image URL
                </label>
                <div className="relative group">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    className="pl-10 rounded-xl border-border h-11"
                    value={currentDiscount?.image || ""}
                    onChange={(e) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        image: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground">
                    Discount Type
                  </label>
                  <Select
                    value={currentDiscount?.type}
                    onValueChange={(val: any) =>
                      setCurrentDiscount({ ...currentDiscount, type: val })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-border h-11 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="Percentage">Percentage Off</SelectItem>
                      <SelectItem value="BOGO">Buy One Get One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground">
                    Value Label
                  </label>
                  <Input
                    placeholder={
                      currentDiscount?.type === "Percentage"
                        ? "e.g. 20%"
                        : "e.g. Buy 2 Get 1"
                    }
                    className="rounded-xl border-border h-11 font-bold"
                    value={currentDiscount?.value || ""}
                    onChange={(e) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    className="rounded-xl border-border h-11 font-bold"
                    value={currentDiscount?.startDate}
                    onChange={(e) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground">
                    End Date
                  </label>
                  <Input
                    type="date"
                    className="rounded-xl border-border h-11 font-bold"
                    value={currentDiscount?.endDate}
                    onChange={(e) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">
                  Usage Limit (Max Users)
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    className="pl-10 rounded-xl border-border h-11 font-bold"
                    value={currentDiscount?.limit || ""}
                    onChange={(e) =>
                      setCurrentDiscount({
                        ...currentDiscount,
                        limit: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  Maximum number of unique customers who can enjoy this
                  discount.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/5 border-t border-border mt-0 sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl h-12 px-6 font-bold"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl h-12 px-8 font-bold bg-primary text-white shadow-lg shadow-primary/20"
            >
              {currentDiscount?.id ? "Update Deal" : "Publish Deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
