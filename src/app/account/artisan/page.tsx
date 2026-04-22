"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ArrowRight,
  Boxes,
  ChartNoAxesColumn,
  ClipboardCheck,
  MapPin,
  Package,
  Paintbrush,
  Phone,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { fetchPublicArtisanProducts, type AdminArtisanProduct } from "@/lib/api/artisans";

type ArtisanStatus = "none" | "pending" | "approved";

type LocalArtisanApplication = {
  fullName: string;
  email: string;
  phone?: string;
  specialty: string;
  location: string;
  story?: string;
  createdAt: string;
};

const ARTISAN_STATUS_KEY = "agri-eco.mock.artisan.status";
const ARTISAN_APP_KEY = "agri-eco.mock.artisan.application";

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getArtisanStatusFromLocal(): ArtisanStatus {
  const v = readLocal<{ status?: ArtisanStatus }>(ARTISAN_STATUS_KEY);
  return v?.status ?? "none";
}

function isLowStock(stock?: number) {
  return typeof stock === "number" && stock > 0 && stock <= 5;
}

export default function AccountArtisanPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ArtisanStatus>("none");
  const [application, setApplication] = useState<LocalArtisanApplication | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<AdminArtisanProduct[]>([]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"stock" | "price" | "name">("stock");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setStatus(getArtisanStatusFromLocal());
    setApplication(readLocal<LocalArtisanApplication>(ARTISAN_APP_KEY));
  }, []);

  const isArtisan = useMemo(() => {
    // Backend-ready: if role becomes 'artisan' later, swap here.
    // For now, allow FARMER role OR localStorage approved flag.
    return user?.role === "farmer" || status === "approved";
  }, [status, user?.role]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!isArtisan || !user?.id) return;
      try {
        setLoadingProducts(true);
        const res = await fetchPublicArtisanProducts(user.id, { limit: 100 });
        if (ignore) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        // Backend not wired? Fall back to mock products.
        if (ignore) return;
        setProducts([
          {
            id: `mock-${user?.id}-1`,
            name: { en: "Handcrafted Basket" },
            price: 18000,
            stock: 12,
            image: "/assets/products/placeholder.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `mock-${user?.id}-2`,
            name: { en: "Clay Pot (Medium)" },
            price: 25000,
            stock: 4,
            image: "/assets/products/placeholder.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `mock-${user?.id}-3`,
            name: { en: "Woven Tray Set" },
            price: 14000,
            stock: 2,
            image: "/assets/products/placeholder.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } finally {
        if (!ignore) setLoadingProducts(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [isArtisan, user?.id]);

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = products.filter((p) => {
      const name = (p.name?.en ?? "").toLowerCase();
      return !q || name.includes(q);
    });
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "stock") return dir * ((a.stock ?? 0) - (b.stock ?? 0));
      if (sortBy === "price") return dir * ((a.price ?? 0) - (b.price ?? 0));
      return dir * String(a.name?.en ?? "").localeCompare(String(b.name?.en ?? ""));
    });
    return rows;
  }, [products, search, sortBy, sortDir]);

  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
    const lowStockCount = products.filter((p) => isLowStock(p.stock)).length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + (p.stock ?? 0) * (p.price ?? 0),
      0,
    );
    return { totalProducts, totalStock, lowStockCount, inventoryValue };
  }, [products]);

  const stockChart = useMemo(() => {
    const top = [...products]
      .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
      .slice(0, 6);
    return top.map((p) => ({
      name: (p.name?.en ?? "Product").slice(0, 14),
      stock: p.stock ?? 0,
    }));
  }, [products]);

  if (!isArtisan) {
    const pending = status === "pending";
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-foreground font-heading mb-1">
              Artisan Portal
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage your artisan profile and products (stock, performance, and analytics).
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/artisans">
              Explore artisans <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <Card className="rounded-md border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              {pending ? "Application pending" : "You are not an artisan yet"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending ? (
              <>
                <p className="text-sm text-muted-foreground">
                  We received your application. You’ll see your portal here once your application is approved.
                </p>
                {application && (
                  <div className="rounded-md border bg-muted/20 p-4 text-sm space-y-2">
                    <p className="font-semibold">{application.fullName}</p>
                    <p className="text-muted-foreground">
                      Specialty: <span className="text-foreground font-medium">{application.specialty}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Location: <span className="text-foreground font-medium">{application.location}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(application.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button asChild>
                    <Link href="/account/artisan/apply">
                      View / update application
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("We’ll notify you once it’s reviewed.")}
                  >
                    How long does review take?
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Want to sell your products on Agri-Eco? Apply to become an artisan and get a dedicated portal to manage your products.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button asChild>
                    <Link href="/account/artisan/apply">
                      Apply to become an artisan <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/partners">Learn more</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading mb-1">
            Artisan Portal
          </h1>
          <p className="text-muted-foreground font-medium">
            Your profile, products, stock health, and performance overview.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
            Verified artisan
          </Badge>
          <Button asChild variant="outline">
            <Link href="/community/artisan/a7bfa9eb-4980-4ea4-814c-b74c05e0ccee">
              Public profile <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-md border-border shadow-soft lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center font-black text-primary">
                {(user?.name ?? "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{application?.fullName ?? user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{application?.email ?? user?.email}</p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-start gap-2">
                <Paintbrush className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Specialty</p>
                  <p className="font-medium">{application?.specialty ?? "Handcrafted goods"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{application?.location ?? "Rwanda"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{application?.phone ?? user?.phone ?? "—"}</p>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/account/artisan/apply">Edit artisan info</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          <Card className="rounded-md border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-black">{kpis.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Total active products listed</p>
            </CardContent>
          </Card>

          <Card className="rounded-md border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-black">{kpis.totalStock}</p>
              <p className="text-xs text-muted-foreground">Units remaining across products</p>
            </CardContent>
          </Card>

          <Card className="rounded-md border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Inventory value
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-black">{kpis.inventoryValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Estimated value (stock × price)</p>
            </CardContent>
          </Card>

          <Card className="rounded-md border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <ChartNoAxesColumn className="h-4 w-4 text-primary" />
                Low stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className={cn("text-3xl font-black", kpis.lowStockCount ? "text-rose-600" : "")}>
                {kpis.lowStockCount}
              </p>
              <p className="text-xs text-muted-foreground">Products with ≤ 5 units remaining</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-md border-border shadow-soft">
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-black">Stock overview</CardTitle>
            <p className="text-xs text-muted-foreground">
              Top products by remaining stock.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[240px] w-full"
            config={{
              stock: { label: "Stock", color: "hsl(var(--primary))" },
            }}
          >
            <BarChart data={stockChart} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="stock" fill="var(--color-stock)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-md border-border shadow-soft">
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-black">My products</CardTitle>
            <p className="text-xs text-muted-foreground">
              Search and sort your catalog. (Orders are not visible in this portal.)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full md:w-auto">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
            />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingProducts ? (
            <p className="text-sm text-muted-foreground">Loading products…</p>
          ) : !visibleProducts.length ? (
            <p className="text-sm text-muted-foreground">No products found.</p>
          ) : (
            <div className="grid gap-3">
              {visibleProducts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-md border p-3 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-md overflow-hidden border bg-muted shrink-0">
                      <img
                        src={p.image || "/assets/products/placeholder.jpg"}
                        alt={p.name?.en || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.name?.en || "Untitled product"}</p>
                      <p className="text-xs text-muted-foreground">
                        Price: <span className="text-foreground font-medium">{(p.price ?? 0).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Stock: <span className="ml-1 font-semibold">{p.stock ?? 0}</span>
                    </Badge>
                    {isLowStock(p.stock) && (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200" variant="outline">
                        Low stock
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

