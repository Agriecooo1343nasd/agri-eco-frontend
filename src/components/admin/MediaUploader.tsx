"use client";

import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Link as LinkIcon, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaUploaderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
}

export function MediaUploader({
  label,
  value,
  onChange,
  placeholder = "Upload image or enter URL...",
  description,
}: MediaUploaderProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
          {label}
        </Label>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "url" | "upload")}
          className="w-auto"
        >
          <TabsList className="h-7 p-0 bg-transparent gap-1">
            <TabsTrigger
              value="upload"
              className="text-[10px] h-6 px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 transition-all rounded"
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="text-[10px] h-6 px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 transition-all rounded"
            >
              <LinkIcon className="h-3 w-3 mr-1" />
              Use URL
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="upload" className="m-0 border-none outline-none">
            <div className="p-4 flex flex-col items-center justify-center gap-3">
              {value && value.startsWith("data:image") ? (
                <div className="relative w-full aspect-[21/9] rounded-md overflow-hidden bg-muted border border-border group">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleUploadClick}
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" /> Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full py-8 border-2 border-dashed border-border/60 rounded-lg flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={handleUploadClick}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Click to browse files
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 text-center max-w-[200px]">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="m-0 border-none outline-none">
            <div className="bg-muted/10 p-3">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={value && !value.startsWith("data:") ? value : ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="pl-9 h-10 bg-background border-border placeholder:text-muted-foreground/50 shadow-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {description && (
        <p className="text-[10px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
