"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLegalDocument, type PolicyBlock } from "@/lib/api/legal";
import { useLanguage } from "@/context/LanguageContext";
import { getML } from "@/components/admin/MultiLangInput";
import { Loader2, ShieldCheck, ScrollText, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface LegalPageViewProps {
  type: "privacy_policy" | "terms_of_service";
}

export function LegalPageView({ type }: LegalPageViewProps) {
  const { locale } = useLanguage();
  const { data: doc, isLoading, isError } = useQuery({
    queryKey: ["legal-document-public", type],
    queryFn: () => fetchLegalDocument(type),
  });

  const title = type === "privacy_policy" ? "Privacy Policy" : "Terms of Service";
  const Icon = type === "privacy_policy" ? ShieldCheck : ScrollText;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Retrieving {title}...
        </p>
      </div>
    );
  }

  if (isError || !doc || doc.blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-black font-heading mb-2 uppercase tracking-tight">Content Unavailable</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium">
          The requested {title.toLowerCase()} is currently under review or has not been published yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <header className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 text-primary mb-2 shadow-sm border border-primary/10">
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black font-heading tracking-tight text-foreground uppercase">
            {getML(doc.title, locale) || title}
          </h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {doc.effectiveAt && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] py-1 px-3">
                Effective: {format(new Date(doc.effectiveAt), "MMMM dd, yyyy")}
              </Badge>
            )}
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Last Updated: {format(new Date(doc.updatedAt), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </header>

      <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Content */}
      <main className="space-y-12">
        {doc.blocks.map((block, idx) => (
          <RenderBlock key={block.id} block={block} index={idx + 1} />
        ))}
      </main>

      {/* Footer / Contact */}
      <footer className="pt-16 border-t border-border">
        <div className="bg-muted/30 rounded-2xl p-8 text-center space-y-4 border border-border/50">
          <h3 className="text-lg font-black uppercase tracking-tight">Questions about these {title.toLowerCase()}?</h3>
          <p className="text-muted-foreground text-sm font-medium max-w-lg mx-auto">
            Our legal team is here to help. If you have any concerns or need clarification on any point, please reach out.
          </p>
          <div className="pt-2">
            <a 
              href="mailto:legal@agrieco.com" 
              className="text-primary font-black uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-4"
            >
              legal@agrieco.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RenderBlock({ block, index, level = 0 }: { block: PolicyBlock; index: number; level?: number }) {
  const { locale } = useLanguage();
  const title = getML(block.title, locale);
  const content = getML(block.content, locale);

  return (
    <div className={cn("space-y-6", level > 0 && "ml-4 sm:ml-8 border-l-2 border-primary/10 pl-6 sm:pl-10 py-2")}>
      {title && (
        <div className="space-y-2">
          {level === 0 && (
             <span className="text-primary font-black text-sm tracking-tighter opacity-40 block mb-1">
               0{index}
             </span>
          )}
          <h2 className={cn(
            "font-black font-heading text-foreground uppercase tracking-tight",
            level === 0 ? "text-3xl" : level === 1 ? "text-xl" : "text-lg"
          )}>
            {title}
          </h2>
        </div>
      )}

      {block.type === "text" ? (
        <div className="prose prose-sm max-w-none prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-medium prose-strong:text-foreground prose-strong:font-black">
          {content.split('\n').map((para, i) => (
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
          ))}
        </div>
      ) : (
        <ul className="space-y-4">
          {content.split('\n').filter(Boolean).map((item, i) => (
            <li key={i} className="flex gap-4 items-start group">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
              <span className="text-muted-foreground font-medium text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {block.subBlocks && block.subBlocks.length > 0 && (
        <div className="space-y-10 mt-8">
          {block.subBlocks.map((sub, i) => (
            <RenderBlock key={sub.id} block={sub} index={i + 1} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
