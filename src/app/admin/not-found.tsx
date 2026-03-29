import Link from "next/link";
import {
  FileQuestion,
  LayoutDashboard,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[min(72vh,720px)] w-full flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-border/80 shadow-lg bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
            <FileQuestion className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Admin · 404
            </p>
            <CardTitle className="font-heading text-2xl md:text-3xl">
              Page not found
            </CardTitle>
            <CardDescription className="text-base mt-3 leading-relaxed">
              This admin URL doesn&apos;t match any screen in the dashboard. Check
              the address for typos, or return to the dashboard.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
          <Button asChild className="flex-1 gap-2" size="lg">
            <Link href="/admin/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 gap-2" size="lg">
            <Link href="/">
              <ExternalLink className="h-4 w-4" />
              View site
            </Link>
          </Button>
        </CardContent>
        <div className="px-6 pb-6 pt-0">
          <Button
            asChild
            variant="ghost"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to admin home
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
