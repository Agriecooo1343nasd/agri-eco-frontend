import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-card/80">
      {/* Newsletter */}
      <div className="border-b border-card/10">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-card font-heading">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm text-card/60 mt-1">
                Get the latest deals and organic recipes in your inbox
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 bg-card/10 border border-card/20 rounded-l-lg text-sm text-card placeholder:text-card/40 outline-none focus:border-primary w-full md:w-72"
              />
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-r-lg font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0">
                Subscribe
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
              Your trusted source for 100% organic, farm-fresh agricultural
              products. We deliver health and sustainability to your doorstep.
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
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: "About Us", href: "/about" },
                { label: "Shop", href: "/shop" },
                { label: "Tours", href: "/tours" },
                { label: "Beekeeping", href: "/beekeeping" },
                { label: "Education", href: "/education" },
                { label: "Community", href: "/community" },
                { label: "Hot Deals", href: "/deals" },
                { label: "My Account", href: "/account" },
                { label: "Wishlist", href: "/wishlist" },
                { label: "Cart", href: "/cart" },
              ].map((link) => (
                <li key={link.label}>
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
              Customer Service
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
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span className="text-sm text-card/60">
                  123 Organic Street, Green Valley, CA 90210
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
            © 2026 Agri-Eco. All rights reserved.
          </p>
          <p className="text-xs text-card/40">
            Organic • Natural • Sustainable
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
