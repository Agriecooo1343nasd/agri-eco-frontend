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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const categories = [
  "Fruits",
  "Vegetables",
  "Juices",
  "Dairy",
  "Honey",
  "Spices",
  "Grains",
  "Herbs",
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Hot Deals", href: "/deals" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount, wishlistItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleUserClick = () => {
    if (isAuthenticated) {
      setUserMenuOpen(!userMenuOpen);
    } else {
      router.push("/login");
    }
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
            <a
              href="tel:+1234567890"
              className="flex items-center gap-1 hover:underline"
            >
              <Phone className="h-3 w-3" />
              <span className="hidden md:inline">+1 (234) 567-890</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container flex items-center justify-between py-3 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold font-heading">
                🌿
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary font-heading leading-tight">
                Agri-Eco
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none">
                Organic & Fresh
              </p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30">
              <input
                type="text"
                placeholder="Search for organic products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-background text-foreground text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="bg-primary text-primary-foreground px-5 hover:bg-primary/90 transition-colors">
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
                <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-[100] overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/20">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-2">
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
              <div className="absolute top-full left-0 bg-card border border-border rounded-b-lg shadow-lg w-52 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${cat}`}
                    onClick={() => setCatOpen(false)}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav links */}
          <div className="flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-5 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground py-3">
            <Phone className="h-3.5 w-3.5" />
            Call Us: +1 (234) 567-890
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
                className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${cat}`}
                className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
