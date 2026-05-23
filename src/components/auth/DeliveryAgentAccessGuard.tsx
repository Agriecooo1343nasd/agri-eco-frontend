"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ShieldAlert, Truck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AUTH_ROLES } from "@/lib/auth-types";

export function DeliveryAgentAccessGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized, user, hasRole, isAdmin } = useAuth();
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
        description: "Please sign in to access the delivery agent portal.",
      });
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Allow admins and delivery agents
    const canAccess = hasRole(AUTH_ROLES.DELIVERY_AGENT) || isAdmin;

    if (!canAccess) {
      hasRedirectedRef.current = true;
      toast.error("Restricted area", {
        description: "This portal is reserved for delivery agents only.",
      });
      router.replace("/");
    }
  }, [hasRole, isAdmin, isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized || !isAuthenticated || (!hasRole(AUTH_ROLES.DELIVERY_AGENT) && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl animate-in fade-in zoom-in duration-300">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Truck className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900">
            Verifying Access
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            Checking delivery agent credentials...
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 animate-[loading_1s_infinite] bg-primary rounded-full" />
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
