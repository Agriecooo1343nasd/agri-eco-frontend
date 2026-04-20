"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Truck,
  Clock,
  Banknote,
  Gift,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchPublicDeliveryZones,
  type DeliveryZone,
} from "@/lib/api/delivery-zones";
import { usePricing } from "@/context/PricingContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 12;

type SortField = "name" | "feeRwf" | "createdAt";

function coverageSummary(coverage: Record<string, unknown>): string | null {
  if (!coverage || typeof coverage !== "object") return null;
  const keys = Object.keys(coverage);
  if (keys.length === 0) return null;
  if (keys.length <= 4) {
    return keys
      .slice(0, 4)
      .map((k) => `${k}: ${String((coverage as Record<string, unknown>)[k])}`)
      .join(" · ");
  }
  return `${keys.length} coverage fields — open details in admin / contact support for specifics`;
}

export default function DeliveryAreasPage() {
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, order]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["public-delivery-zones", page, PAGE_SIZE, debouncedSearch, sort, order],
    queryFn: () =>
      fetchPublicDeliveryZones({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sort,
        order,
      }),
  });

  const zones = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background text-sm">
      <Header />

      <div className="border-b border-border bg-gradient-to-r from-primary/10 via-accent/30 to-primary/5">
        <div className="container py-10 md:py-14">
          <Link
            href="/checkout"
            className="mb-6 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t(translations.deliveryAreasPage.backToCheckout)}
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                {t(translations.deliveryAreasPage.shipping)}
              </p>
              <h1 className="text-2xl md:text-4xl font-bold font-heading text-foreground">
                {t(translations.deliveryAreasPage.title)}
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground text-sm md:text-base">
                {t(translations.deliveryAreasPage.subtitle)}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-foreground">{t(translations.deliveryAreasPage.activeAreas)}</p>
                <p className="text-muted-foreground">
                  {pagination?.total ?? "—"} {t(translations.common?.locationsInRwanda || "locations in Rwanda")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(translations.deliveryAreasPage.searchPlaceholder)}
              className="pl-10 h-11"
            />
            {(isFetching || isLoading) && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-medium">{t(translations.deliveryAreasPage.sort)}</span>
            </div>
            
            <Select value={sort} onValueChange={(v) => setSort(v as SortField)}>
              <SelectTrigger className="w-[140px] h-11 rounded-lg">
                <SelectValue placeholder={t(translations.deliveryAreasPage.sort)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t(translations.deliveryAreasPage.name)}</SelectItem>
                <SelectItem value="feeRwf">{t(translations.deliveryAreasPage.deliveryFee)}</SelectItem>
                <SelectItem value="createdAt">{t(translations.deliveryAreasPage.recentlyAdded)}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
              <SelectTrigger className="w-[120px] h-11 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{t(translations.deliveryAreasPage.ascending)}</SelectItem>
                <SelectItem value="desc">{t(translations.deliveryAreasPage.descending)}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11"
              onClick={() => refetch()}
            >
              {t(translations.deliveryAreasPage.refresh)}
            </Button>
          </div>
        </div>

        {isError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center">
            <p className="text-foreground font-medium">{t(translations.common?.errorLoading || "Could not load delivery zones")}</p>
            <p className="text-muted-foreground text-sm mt-2">
              {t(translations.common?.checkConnection || "Check your connection or try again later.")}
            </p>
            <Button className="mt-4" onClick={() => refetch()}>
              {t(translations.common?.retry || "Retry")}
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">{t(translations.common?.loading || "Loading delivery areas…")}</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="font-semibold text-foreground">{t(translations.common?.noResultsFound || "No zones match your search")}</p>
            <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
              {t(translations.common?.tryAnotherKeyword || "Try another keyword or clear the search to see every active area.")}
            </p>
            {debouncedSearch ? (
              <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setDebouncedSearch(""); }}>
                {t(translations.common?.clearSearch || "Clear search")}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {zones.map((zone: DeliveryZone) => {
                const cov = coverageSummary(zone.coverage ?? {});
                return (
                  <li
                    key={zone.id}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="min-w-0">
                        <h2 className="font-heading font-bold text-foreground text-lg leading-snug">
                          {zone.name}
                        </h2>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          Code: {zone.code}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Active
                      </span>
                    </div>

                    <dl className="space-y-3 text-xs flex-1">
                      <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                        <Banknote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-muted-foreground">{t(translations.deliveryAreasPage.deliveryFee)}</dt>
                          <dd className="font-semibold text-foreground">
                            {formatPrice(zone.feeRwf)}
                          </dd>
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                        <Gift className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-muted-foreground">{t(translations.cartPage.freeShippingNote || "Free delivery from")}</dt>
                          <dd className="font-semibold text-foreground">
                            {formatPrice(zone.freeFromRwf)}
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              {t(translations.cartPage.cartValue || "cart value")}
                            </span>
                          </dd>
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-lg bg-muted/50 p-3">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <dt className="text-muted-foreground">{t(translations.common?.typicalDeliveryWindow || "Typical delivery window")}</dt>
                          <dd className="font-semibold text-foreground">
                            {zone.minDeliveryHours}–{zone.maxDeliveryHours} {t(translations.common?.hours || "hours")}
                          </dd>
                        </div>
                      </div>
                    </dl>

                    {cov ? (
                      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-3">
                        <span className="font-medium text-foreground/80">{t(translations.common?.coverageNote || "Coverage note:")} </span>
                        {cov}
                      </p>
                    ) : (
                      <p className="mt-4 text-[11px] text-muted-foreground border-t border-border pt-3">
                        {t(translations.deliveryAreasPage.uncertainSupport || "Use this zone name and code to confirm with support if you are unsure your address qualifies.")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {pagination && pagination.pages > 1 ? (
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between border-t border-border pt-8">
                <p className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                  <span className="mx-1">·</span>
                  {pagination.total} zones total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t(translations.common?.previous || "Previous")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-1"
                  >
                    {t(translations.common?.next || "Next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-12 rounded-2xl border border-primary/25 bg-primary/5 p-6 md:p-8">
          <h3 className="font-heading font-bold text-foreground text-lg mb-2">
            {t(translations.deliveryAreasPage.readyToOrder)}
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t(translations.deliveryAreasPage.orderInstruction)}
          </p>
          <Button asChild className="mt-4">
            <Link href="/checkout">{t(translations.deliveryAreasPage.continueCheckout)}</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
