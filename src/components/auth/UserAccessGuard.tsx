"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function UserAccessGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized || hasRedirectedRef.current) {
      return;
    }

    if (!isAuthenticated) {
      hasRedirectedRef.current = true;
      toast.error("Login required", {
        description: "Please sign in to access your account dashboard.",
      });
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-xl shadow-primary/5 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary relative">
            <ShieldCheck className="h-10 w-10" />
            <div className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-2xl animate-spin" />
          </div>
          <h2 className="text-2xl font-black font-heading text-foreground mb-4">
            Securing Your Access
          </h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            We are verifying your credentials to ensure your account security.
            This will only take a moment.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 text-primary font-bold text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating session...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
