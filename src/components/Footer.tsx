"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubscribing(true);
      await apiClient.post("/newsletter/subscribe", { email });
      toast.success("Successfully subscribed to the newsletter!");
      setEmail("");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to subscribe. Please try again.";
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-foreground text-card/80">
      {/* Newsletter */}
      <div className="border-b border-card/10">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-card font-heading">
                {t(translations.footer.subscribeTitle)}
              </h3>
              <p className="text-sm text-card/60 mt-1">
                {t(translations.footer.subscribeDesc)}
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder={t(translations.footer.emailPlaceholder)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="px-4 py-3 bg-card/10 border border-card/20 rounded-l-lg text-sm text-card placeholder:text-card/40 outline-none focus:border-primary w-full md:w-72"
              />
              <button 
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-r-lg font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0 flex items-center gap-2 disabled:opacity-75"
              >
                {isSubscribing && <Loader2 className="w-4 h-4 animate-spin" />}
                {t(translations.footer.subscribeBtn)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <img
                src="/assets/logo/logo.png"
                alt="Agri-Eco Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-card/60 leading-relaxed">
              {t(translations.footer.aboutDesc)}
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-card/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-card font-heading mb-4">
              {t(translations.footer.quickLinks)}
            </h4>
            <ul className="space-y-2">
              {[
                { label: t(translations.header.nav.about), href: "/about" },
                { label: t(translations.header.nav.shop), href: "/shop" },
                { label: t(translations.header.nav.tours), href: "/tours" },
                { label: t(translations.header.nav.beekeeping), href: "/beekeeping" },
                { label: t(translations.header.nav.education), href: "/education" },
                { label: t(translations.header.nav.community), href: "/community" },
                { label: t(translations.header.nav.deals), href: "/deals" },
                { label: t(translations.header.account.myAccount), href: "/account" },
                { label: t(translations.header.nav.deals), href: "/wishlist" }, // Missing label for wishlist
                { label: t(translations.header.nav.shop), href: "/cart" }, // Missing label for cart
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-card/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-card font-heading mb-4">
              {t(translations.footer.customerService)}
            </h4>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Returns & Refunds",
                "Shipping Info",
                "Track Order",
                "Privacy Policy",
                "Terms of Service",
              ].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-card/60 hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-card font-heading mb-4">
              {t(translations.header.contact)}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span className="text-sm text-card/60">
                 Musanze-Rubavu road, Byangabo
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-card/60">0785760108</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-card/60">agri-eco@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-card/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-card/40">
            {t(translations.footer.copyright)}
          </p>
          <p className="text-xs text-card/40">
            {t(translations.footer.tagline)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
