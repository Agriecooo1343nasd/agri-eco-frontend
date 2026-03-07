"use client";

import Link from "next/link";
import { CheckCircle2, Mail, Package, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePricing } from "@/context/PricingContext";
import { Button } from "@/components/ui/button";

const PaymentSuccessPage = () => {
  const { formatPrice } = usePricing();
  // Mock order data
  const orderNumber = `AGR-${Date.now().toString().slice(-6)}`;
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mockItems = [
    { name: "Organic Apples", qty: 2, unit: "kg", price: 6.99, oldPrice: 8.99 },
    { name: "Fresh Broccoli", qty: 1, unit: "kg", price: 4.49, oldPrice: null },
    { name: "Raw Honey", qty: 1, unit: "jar", price: 12.99, oldPrice: 15.99 },
  ];

  const subtotal = mockItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = mockItems.reduce(
    (s, i) => (i.oldPrice ? s + (i.oldPrice - i.price) * i.qty : s),
    0,
  );
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 md:py-20 max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground animate-in slide-in-from-top-4 duration-500">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mt-3 text-base animate-in slide-in-from-top-4 duration-700">
          Thank you for your order. Your payment has been processed
          successfully.
        </p>

        {/* Order Details Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-10 text-left shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Order Number
              </p>
              <p className="text-lg font-bold text-foreground font-heading">
                {orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Date
              </p>
              <p className="font-semibold text-foreground text-sm font-heading">
                {orderDate}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            {mockItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-foreground font-heading">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">
                      {item.qty} × {formatPrice(item.price)} / {item.unit}
                    </span>
                    {item.oldPrice && (
                      <span className="text-[9px] font-bold text-badge-sale bg-badge-sale/10 px-1.5 py-0.5 rounded-full border border-badge-sale/20">
                        -
                        {(
                          ((item.oldPrice - item.price) / item.oldPrice) *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-foreground text-base">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-6 pt-6 space-y-3 text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-bold text-foreground font-heading">
                {formatPrice(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-badge-sale">
                <span>Total Savings</span>
                <span className="font-bold">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Shipping</span>
              <span className="font-bold text-primary">Free</span>
            </div>
            <div className="border-t-2 border-dashed border-border pt-4 flex justify-between items-end">
              <span className="font-bold text-foreground text-lg font-heading">
                Total Paid
              </span>
              <span className="font-heading font-black text-primary text-3xl leading-none">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 text-left hover:border-primary/40 transition-all group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm font-heading">
                Check Your Email
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                A confirmation email with your receipt and tracking details has
                been sent to your inbox.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 text-left hover:border-primary/40 transition-all group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm font-heading">
                Track Your Order
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Use order number{" "}
                <span className="font-bold text-foreground">{orderNumber}</span>{" "}
                to track your delivery status in your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Button
            asChild
            className="h-12 px-8 rounded-xl font-bold font-heading text-lg shadow-lg shadow-primary/20"
          >
            <Link href="/shop" className="flex items-center gap-2">
              Continue Shopping <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 rounded-xl font-bold font-heading text-lg"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
