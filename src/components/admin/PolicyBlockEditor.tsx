"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  ListChecks,
  Layout,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MultiLangInput,
  emptyLangValue,
} from "@/components/admin/MultiLangInput";
import { cn } from "@/lib/utils";
import { type PolicyBlock, type PolicyBlockType } from "@/lib/api/legal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PolicyBlockEditorProps {
  blocks: PolicyBlock[];
  onChange: (blocks: PolicyBlock[]) => void;
  level?: number;
}

export function PolicyBlockEditor({
  blocks,
  onChange,
  level = 0,
}: PolicyBlockEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addBlock = (type: PolicyBlockType) => {
    const newBlock: PolicyBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: emptyLangValue(),
      content: emptyLangValue(),
      type,
      subBlocks: [],
    };
    onChange([...blocks, newBlock]);
    setExpandedIds((prev) => ({ ...prev, [newBlock.id]: true }));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<PolicyBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[newIndex];
    newBlocks[newIndex] = temp;
    onChange(newBlocks);
  };

  return (
    <div className={cn("space-y-4", level > 0 && "ml-6 border-l-2 border-primary/20 pl-4")}>
      {blocks.map((block, index) => {
        const isExpanded = expandedIds[block.id];
        return (
          <div
            key={block.id}
            className={cn(
              "bg-card border border-border rounded-xl transition-all shadow-sm",
              isExpanded ? "ring-1 ring-primary/20" : "hover:border-primary/30",
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "p-3 flex items-center gap-3 cursor-pointer select-none",
                isExpanded && "border-b border-border bg-muted/20",
              )}
              onClick={() => toggleExpand(block.id)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  block.type === "text"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-amber-500/10 text-amber-600",
                )}
              >
                {block.type === "text" ? (
                  <Type className="h-4 w-4" />
                ) : (
                  <ListChecks className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate text-foreground">
                  {block.title.en || "Untitled Block"}
                </h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  {block.type === "text" ? "Text Block" : "Checklist Block"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(index, "up");
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === blocks.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(index, "down");
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(block.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="ml-1 text-muted-foreground">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </div>

            {/* Content */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                <MultiLangInput
                  label="Block Title"
                  value={block.title}
                  onChange={(val) => updateBlock(block.id, { title: val })}
                  placeholder="Enter block title..."
                  className="bg-background/50 p-3 rounded-lg border border-border/50"
                />

                <MultiLangInput
                  label={block.type === "text" ? "Block Content" : "Checklist Items"}
                  value={block.content}
                  onChange={(val) => updateBlock(block.id, { content: val })}
                  placeholder={
                    block.type === "text"
                      ? "Enter text content..."
                      : "Enter checklist items (one per line)..."
                  }
                  type="textarea"
                  rows={block.type === "text" ? 4 : 3}
                  className="bg-background/50 p-3 rounded-lg border border-border/50"
                />

                {/* Sub-blocks */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Layout className="h-3 w-3" /> Sub-blocks
                    </h5>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] gap-1 font-bold uppercase tracking-wider"
                        onClick={() => {
                          const subBlocks = [...(block.subBlocks || [])];
                          const newSub: PolicyBlock = {
                            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                            title: emptyLangValue(),
                            content: emptyLangValue(),
                            type: "text",
                            subBlocks: [],
                          };
                          updateBlock(block.id, { subBlocks: [...subBlocks, newSub] });
                          setExpandedIds((prev) => ({ ...prev, [newSub.id]: true }));
                        }}
                      >
                        <PlusCircle className="h-3 w-3" /> Add Text
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] gap-1 font-bold uppercase tracking-wider"
                        onClick={() => {
                          const subBlocks = [...(block.subBlocks || [])];
                          const newSub: PolicyBlock = {
                            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                            title: emptyLangValue(),
                            content: emptyLangValue(),
                            type: "checklist",
                            subBlocks: [],
                          };
                          updateBlock(block.id, { subBlocks: [...subBlocks, newSub] });
                          setExpandedIds((prev) => ({ ...prev, [newSub.id]: true }));
                        }}
                      >
                        <ListChecks className="h-3 w-3" /> Add Checklist
                      </Button>
                    </div>
                  </div>

                  <PolicyBlockEditor
                    blocks={block.subBlocks || []}
                    onChange={(newSub) => updateBlock(block.id, { subBlocks: newSub })}
                    level={level + 1}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-4 pt-2">
        <Button
          variant="outline"
          className="flex-1 h-12 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 gap-2 font-bold uppercase tracking-wider text-xs"
          onClick={() => addBlock("text")}
        >
          <Plus className="h-4 w-4" /> Add Text Block
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 gap-2 font-bold uppercase tracking-wider text-xs"
          onClick={() => addBlock("checklist")}
        >
          <ListChecks className="h-4 w-4" /> Add Checklist Block
        </Button>
      </div>
    </div>
  );
}
