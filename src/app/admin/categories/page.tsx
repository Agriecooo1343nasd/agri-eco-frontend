"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderTree,
  ImageIcon,
  X,
  Package,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  slug: string;
}

const initialCategories: Category[] = [
  {
    id: "CAT-001",
    name: "Organic Fruits",
    slug: "organic-fruits",
    description:
      "Fresh, farm-picked organic fruits without any chemical pesticides.",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=80",
    productCount: 24,
  },
  {
    id: "CAT-002",
    name: "Green Vegetables",
    slug: "green-vegetables",
    description: "Nutrient-rich leafy greens and seasonal vegetables.",
    image:
      "https://images.unsplash.com/photo-1597362868471-333d1b46a75f?auto=format&fit=crop&w=100&q=80",
    productCount: 42,
  },
  {
    id: "CAT-003",
    name: "Natural Juices",
    slug: "natural-juices",
    description: "100% pure fruit extracts and cold-pressed organic juices.",
    image:
      "https://images.unsplash.com/photo-1600271886391-da6fbfa41372?auto=format&fit=crop&w=100&q=80",
    productCount: 15,
  },
  {
    id: "CAT-004",
    name: "Organic Seeds",
    slug: "organic-seeds",
    description: "High-quality heirloom seeds for your own organic farm.",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=100&q=80",
    productCount: 8,
  },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<Partial<Category> | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCurrentCategory({ ...currentCategory, image: url });
      toast.success("Image Selected", {
        description: "Local file ready for upload.",
      });
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [categories, searchQuery]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setCurrentCategory(category);
    } else {
      setCurrentCategory({
        name: "",
        slug: "",
        description: "",
        image: "",
        productCount: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentCategory?.name || !currentCategory?.description) {
      toast.error("Missing Information", {
        description: "Please provide a name and description for the category.",
      });
      return;
    }
    if (currentCategory.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === currentCategory.id ? (currentCategory as Category) : c,
        ),
      );
      toast.success("Category Updated", {
        description: `"${currentCategory.name}" has been modified.`,
      });
    } else {
      const newCat: Category = {
        ...(currentCategory as Category),
        id: `CAT-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        slug: currentCategory.name!.toLowerCase().replace(/\s+/g, "-"),
        productCount: 0,
      };
      setCategories((prev) => [...prev, newCat]);
      toast.success("Category Created", {
        description: `New category "${newCat.name}" added successfully.`,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const cat = categories.find((x) => x.id === id);
    setCategories((prev) => prev.filter((x) => x.id !== id));
    toast.success("Category Deleted", {
      description: cat
        ? `"${cat.name}" has been removed.`
        : "Category removed.",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Taxonomy & Categories
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Organize your organic products into manageable groups.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-5 w-5" /> Add Category
        </Button>
      </div>

      <div className="p-4 rounded-xl border border-border">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
          <Input
            placeholder="Search by category name or keyword..."
            className="pl-12 h-14 rounded-md border-none bg-muted/20 focus:bg-white focus:ring-4 focus:ring-primary/5 font-bold text-base transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[100px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Image
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Category Info
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                  Products
                </TableHead>
                <TableHead className="w-[100px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-border group hover:bg-muted/5 transition-colors"
                >
                  <TableCell className="px-8 py-5">
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-border bg-muted/20 group-hover:scale-105 transition-transform duration-300">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-foreground font-heading leading-tight">
                        {category.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-wider">
                        /{category.slug}
                      </span>
                      <Badge
                        variant="outline"
                        className="w-fit mt-2 rounded-lg bg-primary/5 border-primary/10 text-primary font-bold text-[9px] uppercase"
                      >
                        {category.id}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 max-w-md">
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed italic">
                      &quot;{category.description}&quot;
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/30 text-foreground">
                        <Package className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-black tracking-tight">
                          {category.productCount}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground uppercase mt-1">
                        Listed Items
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[180px] rounded-md p-2 border-border"
                      >
                        <DropdownMenuItem
                          className="rounded-xl px-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold gap-2"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Pencil className="h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-xl px-3 py-2.5 focus:bg-rose-50 text-rose-600 cursor-pointer font-bold gap-2"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border border-dashed opacity-40">
          <FolderTree className="h-16 w-16 mb-4 text-muted-foreground" />
          <p className="text-2xl font-black italic">No categories found</p>
          <p className="text-sm font-medium">
            Try searching for something else
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-md">
          <div className="bg-primary p-8 text-white relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="w-12 h-12 bg-white/20 rounded-md flex items-center justify-center mb-4 shadow-lg shadow-white/10">
              <FolderTree className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black font-heading leading-tight">
              {currentCategory?.id ? "Modify Category" : "New Category"}
            </DialogTitle>
            <DialogDescription className="text-white/70 font-medium">
              Define the taxonomical details of your collection.
            </DialogDescription>
          </div>
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                  Name & Title*
                </label>
                <Input
                  placeholder="e.g. Exotic Extracts"
                  className="rounded-xl border-border h-12 transition-all focus:ring-primary/20 font-bold"
                  value={currentCategory?.name || ""}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                  Description Brief*
                </label>
                <Textarea
                  placeholder="What defines this group of products?"
                  className="rounded-xl border-border min-h-[100px] transition-all focus:ring-primary/20 font-medium italic"
                  value={currentCategory?.description || ""}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                    Cover Image
                  </label>
                  <div className="flex items-center bg-muted rounded-lg p-1">
                    <Button
                      variant={imageMode === "url" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 text-[10px] font-black uppercase rounded-md"
                      onClick={() => setImageMode("url")}
                    >
                      <LinkIcon className="h-3 w-3 mr-1" /> URL
                    </Button>
                    <Button
                      variant={imageMode === "upload" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 text-[10px] font-black uppercase rounded-md"
                      onClick={() => setImageMode("upload")}
                    >
                      <Upload className="h-3 w-3 mr-1" /> Upload
                    </Button>
                  </div>
                </div>
                {imageMode === "url" ? (
                  <div className="relative group">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Paste image URL here..."
                      className="pl-10 rounded-xl border-border h-12 transition-all"
                      value={currentCategory?.image || ""}
                      onChange={(e) =>
                        setCurrentCategory({
                          ...currentCategory,
                          image: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-md cursor-pointer bg-muted/10 hover:bg-muted/30 transition-all hover:border-primary/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {currentCategory?.image ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden mb-2">
                            <img
                              src={currentCategory.image}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        )}
                        <p className="text-xs font-bold text-muted-foreground">
                          Click to upload image
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/5 border-t border-border mt-0 sm:justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Discard
            </Button>
            <Button onClick={handleSave}>
              {currentCategory?.id ? "Update Info" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
