"use client";

import Link from "next/link";
import { Home, Leaf, GraduationCap, MessageCircle, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useFeatures } from "@/context/FeatureContext";

export default function NotFound() {
  const { isFeatureEnabled } = useFeatures();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.18),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,hsl(var(--secondary)/0.12),transparent)]"
          aria-hidden
        />

        <div className="container relative max-w-4xl mx-auto px-4 py-16 md:py-24 lg:py-28 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            Page not found
          </p>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-heading text-foreground tabular-nums leading-none mb-4">
            404
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-2">
            We couldn&apos;t find the page you&apos;re looking for. The link may
            be broken, or the page may have moved.
          </p>
          <p className="text-sm text-muted-foreground/80 mb-10 max-w-md mx-auto">
            Try one of the shortcuts below or head back home to keep exploring
            Agri-Eco.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Button asChild size="lg" className="w-full sm:w-auto min-w-[180px] gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
            {isFeatureEnabled("shopping") && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-w-[180px] gap-2 bg-background/80 backdrop-blur-sm"
              >
                <Link href="/shop">
                  <Search className="h-4 w-4" />
                  Browse shop
                </Link>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-left max-w-3xl mx-auto">
            {isFeatureEnabled("training") && (
              <Link
                href="/education"
                className="group w-full sm:w-[200px] rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <GraduationCap className="h-8 w-8 text-primary mb-2" />
                <p className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                  Education
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Courses &amp; training programs
                </p>
              </Link>
            )}
            {isFeatureEnabled("shopping") && (
              <Link
                href="/community"
                className="group w-full sm:w-[200px] rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <Leaf className="h-8 w-8 text-primary mb-2" />
                <p className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                  Community
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Artisans &amp; local producers
                </p>
              </Link>
            )}
            <Link
              href="/contact"
              className="group w-full sm:w-[200px] rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <MessageCircle className="h-8 w-8 text-primary mb-2" />
              <p className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                Contact
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;re here to help
              </p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
