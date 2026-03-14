"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Expand, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getAboutGalleryImages } from "@/lib/about-store";
import type { AboutGalleryImage } from "@/data/site";

function parseGalleryTimestamp(id: string): number | null {
  const match = id.match(/^gallery-(\d+)-/);
  if (!match) return null;
  return Number(match[1]);
}

export default function GalleryPage() {
  const rawGallery = getAboutGalleryImages();
  const galleryImages: AboutGalleryImage[] = useMemo(
    () =>
      rawGallery.map((img, index) =>
        typeof img === "string"
          ? { id: `about-gallery-${index}`, url: img }
          : img,
      ),
    [rawGallery],
  );

  const sortedGallery = useMemo(() => {
    return [...galleryImages]
      .map((img, index) => {
        const ts = parseGalleryTimestamp(img.id);
        // Admin-created images contain timestamp ids; seed images fallback to index order.
        const rank = ts ?? index;
        return { img, rank };
      })
      .sort((a, b) => b.rank - a.rank)
      .map((entry) => entry.img);
  }, [galleryImages]);

  const [selectedImage, setSelectedImage] = useState<AboutGalleryImage | null>(
    null,
  );
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePageCount, setVisiblePageCount] = useState(5);

  const ITEMS_PER_PAGE = 12;

  const totalPages = Math.max(
    1,
    Math.ceil(sortedGallery.length / ITEMS_PER_PAGE),
  );
  const activePage = Math.min(currentPage, totalPages);

  const paginatedGallery = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return sortedGallery.slice(start, start + ITEMS_PER_PAGE);
  }, [activePage, sortedGallery]);

  useEffect(() => {
    const updateVisiblePageCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisiblePageCount(3);
        return;
      }
      if (width < 1024) {
        setVisiblePageCount(5);
        return;
      }
      setVisiblePageCount(7);
    };

    updateVisiblePageCount();
    window.addEventListener("resize", updateVisiblePageCount);
    return () => window.removeEventListener("resize", updateVisiblePageCount);
  }, []);

  const pageItems = useMemo(() => {
    if (totalPages <= visiblePageCount) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const innerSlots = Math.max(visiblePageCount - 2, 1);
    const half = Math.floor(innerSlots / 2);

    let start = Math.max(2, activePage - half);
    const end = Math.min(totalPages - 1, start + innerSlots - 1);

    if (end - start + 1 < innerSlots) {
      start = Math.max(2, end - innerSlots + 1);
    }

    const items: Array<number | "left-ellipsis" | "right-ellipsis"> = [1];

    if (start > 2) {
      items.push("left-ellipsis");
    }

    for (let p = start; p <= end; p += 1) {
      items.push(p);
    }

    if (end < totalPages - 1) {
      items.push("right-ellipsis");
    }

    items.push(totalPages);
    return items;
  }, [activePage, totalPages, visiblePageCount]);

  const handleOpenImage = (image: AboutGalleryImage) => {
    setSelectedImage(image);
    setGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="container px-4 py-14 md:py-16 mx-auto">
          <div className="flex items-center text-sm text-muted-foreground gap-2 mb-5">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Gallery</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wider mb-5">
              <GalleryVerticalEnd className="h-4 w-4" />
              Events & Moments
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 font-heading leading-tight">
              Agri-Eco Gallery
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Explore the latest moments from our farm tours, educational
              programs, community gatherings, and harvest days.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 py-10 md:py-14 bg-muted/20">
        <div className="container px-4 mx-auto">
          {sortedGallery.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <h2 className="text-xl font-black text-foreground font-heading">
                No Gallery Images Yet
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Gallery items will appear here after they are added from the
                admin About section.
              </p>
              <Button asChild className="mt-6 font-bold">
                <Link href="/about">Back to About</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {paginatedGallery.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleOpenImage(img)}
                    className="group relative w-full aspect-square overflow-hidden rounded-xl border border-border bg-card cursor-zoom-in shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Open image: ${img.caption || "Gallery image"}`}
                  >
                    <img
                      src={img.url}
                      alt={img.caption || "Gallery image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white text-xs sm:text-sm text-left leading-snug line-clamp-2 font-medium">
                          {img.caption || "Captured moment from Agri-Eco."}
                        </p>
                        <Expand className="h-4 w-4 text-white/90 shrink-0" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 md:mt-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (activePage > 1) setCurrentPage(activePage - 1);
                        }}
                        aria-disabled={activePage === 1}
                        className={
                          activePage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {pageItems.map((item, index) => (
                      <PaginationItem key={`${item}-${index}`}>
                        {typeof item === "number" ? (
                          <PaginationLink
                            href="#"
                            isActive={item === activePage}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(item);
                            }}
                          >
                            {item}
                          </PaginationLink>
                        ) : (
                          <PaginationEllipsis />
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (activePage < totalPages)
                            setCurrentPage(activePage + 1);
                        }}
                        aria-disabled={activePage === totalPages}
                        className={
                          activePage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </div>
      </main>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>Gallery Image</DialogTitle>
                <DialogDescription>
                  {selectedImage.caption ||
                    "Captured moments from our farm and community."}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                <div className="w-full overflow-hidden rounded-2xl border border-border bg-black/5">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.caption || "Gallery image"}
                    className="w-full h-full max-h-[70vh] object-contain bg-black/5"
                  />
                </div>
                {selectedImage.caption && (
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.caption}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
