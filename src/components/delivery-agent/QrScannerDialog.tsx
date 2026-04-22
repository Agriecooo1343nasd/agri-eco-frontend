"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  onDetected: (value: string) => void;
};

export function QrScannerDialog({ open, title, onOpenChange, onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const stop = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
    };

    const tick = async () => {
      if (!mounted || !videoRef.current || !detectorRef.current) return;
      const video = videoRef.current;
      if (video.readyState >= 2) {
        try {
          const barcodes = await detectorRef.current.detect(video);
          const first = barcodes?.[0]?.rawValue;
          if (first) {
            onDetected(first);
            onOpenChange(false);
            stop();
            return;
          }
        } catch {
          // ignore frame errors
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    const start = async () => {
      if (!open) {
        stop();
        return;
      }
      if (typeof window === "undefined") return;
      if (!("BarcodeDetector" in window)) {
        setError("QR scanning is not supported in this browser. Please use Chrome/Edge.");
        return;
      }
      try {
        // @ts-ignore
        detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setError(null);
        frameRef.current = requestAnimationFrame(tick);
      } catch {
        setError("Unable to access camera. Check browser permissions.");
      }
    };

    void start();
    return () => {
      mounted = false;
      stop();
    };
  }, [open, onDetected, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border overflow-hidden bg-black/90 aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <CameraOff className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="rounded-md border p-3 text-sm text-muted-foreground flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span>Point your camera at the QR code.</span>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close scanner</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
