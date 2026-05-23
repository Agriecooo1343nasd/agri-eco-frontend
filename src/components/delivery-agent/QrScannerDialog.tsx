"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Upload, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  onDetected: (value: string) => void;
  orderCode?: string;
};

declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

const SCANNER_DIV_ID = "qr-reader-container";
const FILE_SCAN_DIV_ID = "qr-file-scan-temp";

// ─── Ensure hidden temp div exists ───────────────────────────────────────────
function ensureFileScanDiv() {
  if (typeof document === "undefined") return null;
  let el = document.getElementById(FILE_SCAN_DIV_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = FILE_SCAN_DIV_ID;
    el.style.cssText = "display:none;position:fixed;top:-9999px;left:-9999px;";
    document.body.appendChild(el);
  }
  return el;
}

// ─── Scanning Logic ──────────────────────────────────────────────────────────
async function decodeUploadedFile(file: File): Promise<string | null> {
  // 1. Try Native BarcodeDetector (Super fast & extremely robust for high-density)
  if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    try {
      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const detections = await detector.detect(bitmap);
      if (detections && detections.length > 0) {
        return detections[0].rawValue;
      }
    } catch (e) {
      console.warn("[QR][native] fallback to library", e);
    }
  }

  if (window.Html5Qrcode) {
    try {
      ensureFileScanDiv();
      const scanner = new window.Html5Qrcode(FILE_SCAN_DIV_ID);
      const result = await scanner.scanFile(file, true);
      if (result) {
        console.log("[QR][h5q] ✅ detected:", result.slice(0, 30));
        return result;
      }
    } catch (e) {}
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function QrScannerDialog({ open, title, onOpenChange, onDetected, orderCode }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(false);

  // Load Library
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Html5Qrcode) {
      setLibraryLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
    script.onload = () => setLibraryLoaded(true);
    script.onerror = () => setError("Failed to load QR library.");
    document.head.appendChild(script);
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn("Stop scanner error:", e);
      }
      scannerRef.current = null;
    }
    setScanning(false);
    const container = document.getElementById(SCANNER_DIV_ID);
    if (container) container.innerHTML = "";
  }, []);

  const initScanner = useCallback(async () => {
    if (!window.Html5Qrcode || !mountedRef.current) return;
    try {
      await stopScanner();
      const scanner = new window.Html5Qrcode(SCANNER_DIV_ID);
      scannerRef.current = scanner;

      const cameras = await window.Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) throw new Error("No camera found.");

      const backCamera = cameras.find((c: any) => c.label?.toLowerCase().includes("back"));
      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      await scanner.start(
        cameraId,
        {
          fps: 30,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        },
        (text: string) => {
          setSuccess(true);
          setScanning(false);
          setTimeout(() => {
            onDetected(text);
            onOpenChange(false);
          }, 800);
        },
        () => {} // frame errors are ignored
      );

      setScanning(true);
      setHasPermission(true);
      setError(null);
    } catch (e: any) {
      console.error("Scanner Error:", e);
      setHasPermission(false);
      setScanning(false);
      setError(e.message?.includes("Permission") ? "Camera access denied." : "Could not start camera.");
    }
  }, [onDetected, onOpenChange, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;
    if (open && libraryLoaded && !previewUrl) {
      setSuccess(false);
      setError(null);
      const t = setTimeout(initScanner, 300);
      return () => {
        clearTimeout(t);
        mountedRef.current = false;
        stopScanner();
      };
    }
    return () => { mountedRef.current = false; stopScanner(); };
  }, [open, libraryLoaded, initScanner, stopScanner, previewUrl]);

  const clearPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setProcessingImage(true);
    setError(null);
    
    await stopScanner();

    try {
      const result = await decodeUploadedFile(file);
      setProcessingImage(false);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onDetected(result);
          onOpenChange(false);
        }, 800);
      } else {
        setError("No valid QR code found in this image. Try a higher resolution screenshot.");
      }
    } catch (err: any) {
      setProcessingImage(false);
      setError("Error reading image file.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) clearPreview();
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {previewUrl ? "Reviewing uploaded image" : "Scan the QR code from the customer's device"}
            </p>
            {orderCode && <Badge variant="secondary" className="font-mono">{orderCode}</Badge>}
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden bg-black shadow-inner group">
            {previewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <img src={previewUrl} alt="QR Preview" className="max-w-full max-h-full object-contain" />
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute top-4 right-4 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={clearPreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div id={SCANNER_DIV_ID} className="absolute inset-0 w-full h-full [&>video]:object-cover" />
                {!success && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative w-3/4 aspect-square">
                      {(["tl", "tr", "bl", "br"] as const).map(c => (
                        <div key={c} className={`absolute w-8 h-8 border-primary border-4 rounded-sm ${
                          c === "tl" ? "top-0 left-0 border-r-0 border-b-0" :
                          c === "tr" ? "top-0 right-0 border-l-0 border-b-0" :
                          c === "bl" ? "bottom-0 left-0 border-r-0 border-t-0" :
                          "bottom-0 right-0 border-l-0 border-t-0"
                        }`} />
                      ))}
                      {scanning && <div className="absolute left-0 right-0 h-1 bg-primary/60 shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-scan" />}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Success Animation */}
            {success && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-primary/90 text-white animate-in fade-in zoom-in duration-300">
                <CheckCircle className="h-20 w-20 mb-4 animate-bounce" />
                <p className="text-xl font-bold">QR Detected!</p>
              </div>
            )}

            {/* Loading States */}
            {processingImage && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 text-white gap-3 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Processing QR Image...</p>
              </div>
            )}

            {(!libraryLoaded || (open && !scanning && !error && !success && !previewUrl)) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Initializing camera...</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 py-3 px-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold leading-relaxed">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            <Button 
              variant="outline" 
              className="rounded-xl h-12 gap-2 font-bold text-xs uppercase tracking-wider"
              onClick={() => fileInputRef.current?.click()}
              disabled={processingImage || success}
            >
              {processingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {previewUrl ? "Change Image" : "Upload Image"}
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl h-12 font-bold text-xs uppercase tracking-wider border-destructive/20 text-destructive hover:bg-destructive/5" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>

        <style jsx global>{`
          @keyframes scan {
            0%, 100% { top: 5%; opacity: 0.5; }
            50% { top: 95%; opacity: 1; }
          }
          .animate-scan { animation: scan 2.5s ease-in-out infinite; }
          #qr-reader-container img { display: none !important; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}