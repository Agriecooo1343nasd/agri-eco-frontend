import { useState } from "react";
import { languages, type LangCode } from "@/i18n/config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type MultiLangValue = Record<LangCode, string>;

export const emptyLangValue = (): MultiLangValue => ({
  en: "",
  rw: "",
  fr: "",
  sw: "",
});

interface MultiLangInputProps {
  label: string;
  value: MultiLangValue;
  onChange: (val: MultiLangValue) => void;
  placeholder?: string;
  required?: boolean;
  type?: "input" | "textarea";
  rows?: number;
  className?: string;
}

export function MultiLangInput({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "input",
  rows = 3,
  className,
}: MultiLangInputProps) {
  const [activeLang, setActiveLang] = useState<LangCode>("en");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      </div>
      {/* Language tabs */}
      <div className="flex rounded-lg border border-border overflow-hidden bg-muted/30">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveLang(lang.code)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0",
              activeLang === lang.code
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <span className="text-sm">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
      {/* Input field */}
      {type === "textarea" ? (
        <Textarea
          value={value[activeLang] || ""}
          onChange={(e) => onChange({ ...value, [activeLang]: e.target.value })}
          placeholder={`${placeholder} (${languages.find((l) => l.code === activeLang)?.label})`}
          rows={rows}
          required={required && activeLang === "en"}
        />
      ) : (
        <Input
          value={value[activeLang] || ""}
          onChange={(e) => onChange({ ...value, [activeLang]: e.target.value })}
          placeholder={`${placeholder} (${languages.find((l) => l.code === activeLang)?.label})`}
          required={required && activeLang === "en"}
        />
      )}
      {/* Completion indicators */}
      <div className="flex gap-1">
        {languages.map((lang) => (
          <span
            key={lang.code}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              value[lang.code]?.trim() ? "bg-primary" : "bg-border",
            )}
            title={`${lang.label}: ${value[lang.code]?.trim() ? "filled" : "empty"}`}
          />
        ))}
      </div>
    </div>
  );
}

export type { LangCode as MultiLangCode };
