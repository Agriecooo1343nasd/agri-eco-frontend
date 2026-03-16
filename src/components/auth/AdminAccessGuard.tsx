"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function AdminAccessGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized, isAdmin } = useAuth();
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
        description:
          "Please sign in with an administrator account to continue.",
      });
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isAdmin) {
      hasRedirectedRef.current = true;
      toast.error("Restricted area", {
        description:
          "This section is reserved for authorized administrative users.",
      });
      router.replace("/");
    }
  }, [isAdmin, isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black font-heading text-foreground">
            Checking access
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We are verifying whether this account has permission to enter the
            admin workspace.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
