"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast border border-slate-200 bg-white text-black shadow-2xl",
          title: "text-sm font-bold text-black",
          description: "text-xs text-slate-600",
          error: "border-red-500/40 bg-white text-black",
          success: "border-emerald-500/40 bg-white text-black",
          warning: "border-amber-500/40 bg-white text-black",
          info: "border-blue-500/35 bg-white text-black",
          closeButton:
            "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-black",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-600" />,
        info: <InfoIcon className="size-4 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-slate-600" />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#111827",
          "--normal-border": "#e2e8f0",
          "--success-bg": "#ffffff",
          "--success-text": "#111827",
          "--success-border": "#22c55e66",
          "--error-bg": "#ffffff",
          "--error-text": "#111827",
          "--error-border": "#ef444466",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
