"use client";

import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  MessageCircle,
  Globe,
  ShoppingBag,
  Map,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, type LanguageCode } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { fetchCategoriesForAdmin } from "@/lib/api/products";
import { Skeleton } from "@/components/ui/skeleton";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "rw", label: "Kinyarwanda", flag: "🇷🇼" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "sw", label: "Kiswahili", flag: "🇹🇿" },
] as const;

const searchScopes = [
  {
    key: "products",
    label: "Products",
    icon: ShoppingBag,
    placeholder: "Search for organic products...",
  },
  {
    key: "tours",
    label: "Tours",
    icon: Map,
    placeholder: "Search for tours...",
  },
  {
    key: "training",
    label: "Training",
    icon: GraduationCap,
    placeholder: "Search for training programs...",
  },
] as const;

type SearchScope = (typeof searchScopes)[number]["key"];



const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Tours", href: "/tours" },
  { label: "Beekeeping", href: "/beekeeping" },
  { label: "Education", href: "/education" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
  { label: "Hot Deals", href: "/deals" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<SearchScope>("products");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [catPage, setCatPage] = useState(1);
  const { cartCount, wishlistItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { locale, setLocale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const currentScope = searchScopes.find((s) => s.key === searchScope)!;
  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const { data: categoriesData, isLoading: isLoadingCats } = useQuery({
    queryKey: ["header-categories", catSearch, catPage],
    queryFn: () => fetchCategoriesForAdmin({ search: catSearch, page: catPage, limit: 10 }),
    enabled: catOpen,
  });

  const catList = categoriesData?.data || [];

  const handleUserClick = () => {
    if (isAuthenticated) {
      setUserMenuOpen(!userMenuOpen);
    } else {
      router.push("/login");
    }
  };

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  // Header search handler (move outside JSX)
  const handleHeaderSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    let target = "/shop";
    if (searchScope === "tours") target = "/tours";
    if (searchScope === "training") target = "/education";
    router.push(`${target}?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-topbar text-topbar-foreground text-sm py-2">
        <div className="container flex items-center justify-between">
          <span className="hidden sm:inline">
            Welcome to Agri-Eco — Fresh Organic Products
          </span>
          <span className="sm:hidden text-xs">Welcome to Agri-Eco</span>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-topbar-foreground/10 transition-colors text-xs">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{currentLang.flag}</span>
                  <span className="hidden sm:inline">
                    {currentLang.code.toUpperCase()}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code as LanguageCode);
                    }}
                    className={`gap-2.5 ${locale === lang.code ? "bg-primary/10 text-primary font-medium" : ""}`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/feedback"
              className="flex items-center gap-1 hover:underline"
            >
              <MessageCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Feedback</span>
            </Link>
            <a
              href="tel:+1234567890"
              className="flex items-center gap-1 hover:underline"
            >
              <Phone className="h-3 w-3" />
              <span className="hidden md:inline">0785760108</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container flex items-center justify-between py-3 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/logo/logo.png"
              alt="Agri-Eco Logo"
              width={180}
              height={56}
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Search bar with scope dropdown */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-accent/50 border-r border-border text-sm text-foreground hover:bg-accent transition-colors whitespace-nowrap outline-none"
                  >
                    <currentScope.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {currentScope.label}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {searchScopes.map((scope) => (
                    <DropdownMenuItem
                      key={scope.key}
                      onClick={() => setSearchScope(scope.key)}
                      className={`gap-2.5 ${searchScope === scope.key ? "bg-primary/10 text-primary font-medium" : ""}`}
                    >
                      <scope.icon className="h-4 w-4" />
                      {scope.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                type="text"
                placeholder={currentScope.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-background text-foreground text-sm outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleHeaderSearch();
                  }
                }}
              />
              <button
                className="bg-primary text-primary-foreground px-5 hover:bg-primary/90 transition-colors"
                onClick={handleHeaderSearch}
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-foreground" />
              <span className="absolute -top-0.5 -right-0.5 bg-badge-sale text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistItems.length}
              </span>
            </Link>
            <Link
              href="/cart"
              className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-foreground" />
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </Link>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={handleUserClick}
                className="p-2 hover:bg-accent rounded-lg transition-colors flex items-center gap-1"
                aria-label="Account"
              >
                <User className="h-5 w-5 text-foreground" />
                {isAuthenticated && (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>

              {isAuthenticated && userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-100 overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/20">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                      >
                        <span className="text-base"></span> Go to Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className="md:hidden p-2 hover:bg-accent rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex w-full border border-border rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 px-3 py-2 bg-background text-foreground text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="bg-primary text-primary-foreground px-4">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-card border-b border-border hidden md:block">
        <div className="container flex items-center gap-0">
          {/* Categories dropdown */}
          <div className="relative">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <Menu className="h-4 w-4" />
              All Categories
              <ChevronDown
                className={`h-3 w-3 transition-transform ${catOpen ? "rotate-180" : ""}`}
              />
            </button>
            {catOpen && (
              <div className="absolute top-full left-0 bg-card border border-border rounded-b-lg shadow-lg w-64 z-50 overflow-hidden">
                <div className="p-2 border-b border-border bg-muted/30">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={catSearch}
                      onChange={(e) => {
                        setCatSearch(e.target.value);
                        setCatPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md outline-none focus:border-primary shadow-sm"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {isLoadingCats ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="px-4 py-2.5">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))
                  ) : catList.length > 0 ? (
                    catList.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.id}`}
                        onClick={() => setCatOpen(false)}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors border-l-2 border-transparent hover:border-primary"
                      >
                         {cat.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-xs text-muted-foreground text-center">
                      No categories found
                    </p>
                  )}
                </div>
                {categoriesData?.pagination && categoriesData.pagination.pages > 1 && (
                  <div className="p-2 bg-muted/10 border-t border-border flex items-center justify-between gap-2">
                    <button
                      disabled={catPage <= 1}
                      onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-background border border-border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                      {catPage} / {categoriesData.pagination.pages}
                    </span>
                    <button
                      disabled={catPage >= categoriesData.pagination.pages}
                      onClick={() => setCatPage((p) => p + 1)}
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-background border border-border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav links */}
          <div className="flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-5 py-3 text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.href)
                    ? "text-primary font-bold underline decoration-primary underline-offset-8"
                    : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-card border-b border-border shadow-lg">
          <div className="py-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "block px-4 py-3 text-sm font-medium transition-colors hover:bg-accent",
                  isActive(link.href)
                    ? "text-primary bg-primary/5 border-l-4 border-primary font-bold"
                    : "text-foreground",
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </p>
            {catList.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
