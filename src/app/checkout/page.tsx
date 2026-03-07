"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import { Button } from "@/components/ui/button";

type PaymentMethod = "momo" | "card" | null;

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { formatPrice } = usePricing();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [momoNumber, setMomoNumber] = useState("");
  const [momoProcessing, setMomoProcessing] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Rwanda",
    notes: "",
  });

  const shipping = cartTotal > 50 ? 0 : 5.99;
  const discount = cartItems.reduce((sum, { product, quantity }) => {
    if (product.oldPrice)
      return sum + (product.oldPrice - product.price) * quantity;
    return sum;
  }, 0);
  const grandTotal = cartTotal + shipping;

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.address &&
    form.city;

  const handleMomoPayment = () => {
    if (!momoNumber || momoNumber.length < 10) return;
    setMomoProcessing(true);
    setTimeout(() => {
      setMomoProcessing(false);
      clearCart();
      router.push("/payment-success");
    }, 3000);
  };

  const handleCardPayment = () => {
    setCardProcessing(true);
    setTimeout(() => {
      setCardProcessing(false);
      clearCart();
      router.push("/payment-success");
    }, 3000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-xl font-bold font-heading text-foreground">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mt-2">
            Add items to your cart before checking out.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Shop <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-sm">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-primary/10 via-accent to-primary/5 border-b border-border">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Checkout
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-semibold">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — Form */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Shipping Info */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="font-heading font-bold text-foreground text-lg mb-5 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Shipping Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="+250 78X XXX XXX"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1.5">
                    Street Address *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="KG 123 St"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    City *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="Kigali"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    State / Province
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="Kigali Province"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    ZIP / Postal Code
                  </label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="00000"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Country
                  </label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                  >
                    <option>Rwanda</option>
                    <option>Uganda</option>
                    <option>Kenya</option>
                    <option>Tanzania</option>
                    <option>Burundi</option>
                    <option>DR Congo</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block font-semibold text-foreground mb-1.5">
                  Order Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleInput}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground resize-none transition-all"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="font-heading font-bold text-foreground text-lg mb-5 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MOMO */}
                <button
                  onClick={() => setPaymentMethod("momo")}
                  className={`border-2 rounded-xl p-5 text-left transition-all ${
                    paymentMethod === "momo"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="h-6 w-6 text-primary" />
                    <span className="font-bold text-foreground">
                      Mobile Money (MOMO)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pay via MTN MoMo, Airtel Money, or other mobile wallets
                  </p>
                </button>

                {/* Card */}
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`border-2 rounded-xl p-5 text-left transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <span className="font-bold text-foreground">
                      Credit / Debit Card
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visa, Mastercard — securely processed
                  </p>
                </button>
              </div>

              {/* MOMO form */}
              {paymentMethod === "momo" && (
                <div className="mt-6 bg-accent border border-border rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-semibold text-foreground text-sm font-heading">
                    Enter your Mobile Money number
                  </h3>
                  <input
                    type="tel"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="078X XXX XXX"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    You will receive a USSD push notification to confirm the
                    payment on your phone.
                  </p>
                  <Button
                    onClick={handleMomoPayment}
                    disabled={
                      !isFormValid || momoProcessing || momoNumber.length < 10
                    }
                    className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {momoProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Waiting for confirmation...
                      </>
                    ) : (
                      <>Pay {formatPrice(grandTotal)} via MoMo</>
                    )}
                  </Button>
                </div>
              )}

              {/* Card form */}
              {paymentMethod === "card" && (
                <div className="mt-6 bg-accent border border-border rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-semibold text-foreground text-sm font-heading">
                    Card Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <input
                        placeholder="Card Number"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground font-medium"
                      />
                    </div>
                    <input
                      placeholder="MM / YY"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground font-medium"
                    />
                    <input
                      placeholder="CVC"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground font-medium"
                    />
                    <div className="sm:col-span-2">
                      <input
                        placeholder="Name on Card"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Your payment is secure and encrypted</span>
                  </div>
                  <Button
                    onClick={handleCardPayment}
                    disabled={!isFormValid || cardProcessing}
                    className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {cardProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing payment...
                      </>
                    ) : (
                      <>Pay {formatPrice(grandTotal)} with Card</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-36 shadow-sm">
              <h3 className="font-heading font-bold text-foreground text-lg mb-4">
                Order Summary
              </h3>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {cartItems.map(({ product, quantity }) => {
                  const subtotal = product.price * quantity;
                  const hasDiscount = !!product.oldPrice;
                  return (
                    <div key={product.id} className="flex gap-3 items-start">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quantity} × {formatPrice(product.price)} /{" "}
                          {product.unit}
                        </p>
                        {hasDiscount && (
                          <span className="text-[10px] font-bold text-badge-sale bg-badge-sale/10 px-1.5 py-0.5 rounded-full">
                            Save{" "}
                            {formatPrice(
                              (product.oldPrice! - product.price) * quantity,
                            )}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-foreground">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground font-heading">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-badge-sale">
                    <span>Discounts Applied</span>
                    <span className="font-semibold">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-foreground font-heading">
                    {shipping === 0 ? (
                      <span className="text-primary font-bold">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="border-t-2 border-dashed border-border pt-4 flex justify-between items-end">
                  <span className="font-bold text-foreground text-base">
                    Grand Total
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      Total inclusive of taxes
                    </p>
                    <p className="font-bold text-primary text-2xl font-heading leading-tight">
                      {formatPrice(grandTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>100% Safe and Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
