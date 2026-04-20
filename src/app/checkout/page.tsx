"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  ArrowRight,
  Loader2,
  MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { fetchMyAddresses, UserAddress, addAddress } from "@/lib/api/user";
import { validateDiscountCode } from "@/lib/api/discounts";
import { placeOrder } from "@/lib/api/orders";
import { fetchPublicDeliveryZones } from "@/lib/api/delivery-zones";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

type PaymentMethod = "momo" | "card" | "cod" | null;

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { formatPrice } = usePricing();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  const [discountCode, setDiscountCode] = useState("");
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ amount: number; code: string } | null>(null);
  const [discountFeedback, setDiscountFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [momoNumber, setMomoNumber] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
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

  const [saveAddress, setSaveAddress] = useState(false);

  const { data: zonesPreview } = useQuery({
    queryKey: ["checkout-delivery-zones-preview"],
    queryFn: () =>
      fetchPublicDeliveryZones({
        limit: 10,
        page: 1,
        sort: "name",
        order: "asc",
      }),
  });

  // Fetch addresses on load
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingAddresses(true);
      fetchMyAddresses()
        .then((data) => {
          setAddresses(data);
          const def = data.find((a) => a.isDefault);
          if (def) {
            setSelectedAddressId(def.id);
            setForm({
              firstName: user?.firstName || user?.name?.split(" ")[0] || "",
              lastName: user?.lastName || user?.name?.split(" ")[1] || "",
              email: user?.email || "",
              phone: user?.phone || "",
              address: def.street + (def.label && def.label !== "Home" ? ` (${def.label})` : ""),
              city: def.city,
              state: def.state,
              zip: def.zipCode || "",
              country: def.country,
              notes: "",
            });
          }
        })
        .finally(() => setLoadingAddresses(false));
    }
  }, [isAuthenticated, user]);

  const handleAddressSelect = (id: string | "new") => {
    setSelectedAddressId(id);
    if (id === "new") {
      setForm({ ...form, address: "", city: "", state: "", zip: "" });
    } else {
      const addr = addresses.find((a) => a.id === id);
      if (addr) {
        setForm({
          ...form,
          phone: user?.phone || form.phone,
          address: addr.street + (addr.label && addr.label !== "Home" ? ` (${addr.label})` : ""),
          city: addr.city,
          state: addr.state,
          zip: addr.zipCode || "",
          country: addr.country,
        });
      }
    }
  };

  const shipping = cartTotal > 50 ? 0 : 5.99;
  const itemDiscounts = cartItems.reduce((sum, { product, quantity }) => {
    if (product.oldPrice)
      return sum + (product.oldPrice - product.price) * quantity;
    return sum;
  }, 0);
  
  const totalAfterItemDiscounts = cartTotal; 
  const couponDiscountAmount = appliedDiscount?.amount || 0;
  const grandTotal = Math.max(0, totalAfterItemDiscounts + shipping - couponDiscountAmount);

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleValidateDiscount = async () => {
    const normalizedCode = discountCode.trim().toUpperCase();
    if (!normalizedCode) return;
    setIsValidatingDiscount(true);
    setDiscountFeedback(null);
    try {
      const res = await validateDiscountCode(normalizedCode, totalAfterItemDiscounts);
      
      if (res.valid) {
        let eligibleSubtotal = totalAfterItemDiscounts;
        const hasProductRestrictions = res.applicableProducts?.length > 0;
        
        if (hasProductRestrictions) {
          eligibleSubtotal = cartItems.reduce((sum, item) => {
            if (res.applicableProducts.includes(item.product.id)) {
              return sum + (item.product.price * item.quantity);
            }
            // If we had categoryUUIDs we would check res.applicableCategories here too
            return sum;
          }, 0);
        }

        let calculatedDiscount = 0;
        if (res.type === "percentage" || res.type === "flash_sale") {
          calculatedDiscount = (eligibleSubtotal * res.value) / 100;
        } else if (res.type === "fixed") {
          calculatedDiscount = Math.min(res.value, eligibleSubtotal);
        }

        if (calculatedDiscount > 0) {
          setAppliedDiscount({ amount: calculatedDiscount, code: res.code });
          setDiscountCode(res.code);
          const message = `Code ${res.code} applied. You saved ${formatPrice(calculatedDiscount)}.`;
          setDiscountFeedback({ type: "success", message });
          toast.success(message);
        } else {
          setAppliedDiscount({ amount: 0, code: res.code });
          const message = "Code is valid, but none of your items are eligible.";
          setDiscountFeedback({ type: "error", message });
          toast.error(message);
        }
      } else {
        setAppliedDiscount(null);
        const message = "Invalid or expired discount code.";
        setDiscountFeedback({ type: "error", message });
        toast.error(message);
      }
    } catch (err: any) {
      setAppliedDiscount(null);
      const backendMessage =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        t(translations.checkoutPage.discountError || "Failed to validate discount code.");
      setDiscountFeedback({ type: "error", message: backendMessage });
      toast.error(backendMessage);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.address &&
    form.address.length >= 5 &&
    form.zip &&
    form.city;

  const handlePlaceOrder = async () => {
    if (!isFormValid || !paymentMethod) return;
    
    setIsPlacingOrder(true);
    try {
      const payload = {
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`,
          phone: form.phone,
          addressLine1: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.zip,
          country: form.country,
        },
        paymentMethod: paymentMethod === "momo" ? "wallet" : paymentMethod === "card" ? "card" : "cod",
        notes: form.notes,
        discountCode: appliedDiscount?.code,
        shippingCost: shipping,
      };

      const order = await placeOrder(payload);
      
      // If "Save Address" is checked and it's a new address
      if (isAuthenticated && selectedAddressId === "new" && saveAddress) {
        try {
          await addAddress({
            street: form.address,
            city: form.city,
            state: form.state,
            country: form.country,
            zipCode: form.zip,
            label: "Home" // Default label
          });
          toast.success("Address saved to profile!");
        } catch (addrErr) {
          console.error("Failed to save address:", addrErr);
          // Don't fail the whole order if address saving fails
        }
      }
      
      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/account/orders/${order.orderNumber}`);
      } else {
        // Handle online payment initiation
        // For simulation, we'll just redirect to success
        toast.success("Order placed. Processing payment...");
        setTimeout(() => {
          clearCart();
          router.push(`/account/orders/${order.orderNumber}`);
        }, 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-xl font-bold font-heading text-foreground">
            {t(translations.checkoutPage.emptyTitle || "Your cart is empty")}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t(translations.checkoutPage.emptyDesc || "Add items to your cart before checking out.")}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {t(translations.checkoutPage.shopNow || "Go to Shop")} <ArrowRight className="h-4 w-4" />
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
            {t(translations.checkoutPage.title)}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              {t(translations.checkoutPage.home)}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/cart" className="hover:text-primary transition-colors">
              {t(translations.checkoutPage.cart)}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-semibold">{t(translations.checkoutPage.title)}</span>
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
                <Truck className="h-5 w-5 text-primary" /> {t(translations.checkoutPage.shippingInfo)}
              </h2>

              <Link
                href="/delivery-areas"
                className="group mb-6 flex w-full flex-col gap-3 rounded-xl border-2 border-amber-600/40 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent p-4 text-left transition-colors hover:border-amber-600/60 hover:from-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/25 text-amber-800 dark:text-amber-200">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {t(translations.checkoutPage.deliveryAreaCheck)}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(translations.checkoutPage.deliveryAreaDesc)}
                  </p>
                  {zonesPreview?.data && zonesPreview.data.length > 0 ? (
                    <p className="text-[11px] text-muted-foreground pt-1">
                      <span className="font-medium text-foreground">{t(translations.checkoutPage.examples)}: </span>
                      {zonesPreview.data.slice(0, 4).map((z) => z.name).join(" · ")}
                      {zonesPreview.pagination && zonesPreview.pagination.total > 4
                        ? " · …"
                        : ""}
                    </p>
                  ) : null}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary sm:shrink-0">
                  {t(translations.checkoutPage.viewDeliveryAreas)}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              {isAuthenticated && (
                <div className="mb-6 space-y-3">
                  <label className="block font-semibold text-foreground text-sm flex items-center gap-2">
                    {t(translations.checkoutPage.shippingDestination)}
                  </label>
                  
                  {loadingAddresses ? (
                    <div className="flex items-center gap-2 text-muted-foreground p-4 bg-accent/10 rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Loading saved addresses...</span>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleAddressSelect(addr.id)}
                          className={`p-3 text-left border rounded-xl transition-all relative ${
                            selectedAddressId === addr.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50 bg-accent/20"
                          }`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="absolute top-2 right-2">
                              <ShieldCheck className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          <p className="font-bold text-xs truncate pr-4">{addr.label || "Saved Address"}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {addr.street}, {addr.city}
                          </p>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddressSelect("new")}
                        className={`p-3 text-left border rounded-xl transition-all ${
                          selectedAddressId === "new"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 bg-accent/20"
                        }`}
                      >
                        <p className="font-bold text-xs">{t(translations.checkoutPage.useDifferentAddress)}</p>
                        <p className="text-[10px] text-muted-foreground">{t(translations.checkoutPage.enterManually)}</p>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/20">
                      <p className="text-xs text-muted-foreground">
                        {t(translations.checkoutPage.noSavedAddresses)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    {t(translations.checkoutPage.firstName)} *
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
                    {t(translations.checkoutPage.lastName)} *
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
                    {t(translations.checkoutPage.email)} *
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
                    {t(translations.checkoutPage.phone)} *
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
                    {t(translations.checkoutPage.address)} *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleInput}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
                    placeholder="KG 123 St, House 45"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    {t(translations.checkoutPage.city)} *
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
                    {t(translations.checkoutPage.state)}
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
                    {t(translations.checkoutPage.zip)} *
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
                    {t(translations.checkoutPage.country)}
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

              {isAuthenticated && selectedAddressId === "new" && (
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="saveAddress" className="text-sm font-medium text-muted-foreground cursor-pointer">
                    {t(translations.checkoutPage.saveAddress)}
                  </label>
                </div>
              )}

              <div className="mt-4">
                <label className="block font-semibold text-foreground mb-1.5">
                  {t(translations.checkoutPage.orderNotes)}
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleInput}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground resize-none transition-all"
                  placeholder={t(translations.checkoutPage.notesPlaceholder)}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="font-heading font-bold text-foreground text-lg mb-5 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> {t(translations.checkoutPage.paymentMethod)}
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
                      {t(translations.checkoutPage.momo)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(translations.checkoutPage.momoDesc)}
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
                      {t(translations.checkoutPage.card)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visa, Mastercard — securely processed
                  </p>
                </button>

                {/* COD */}
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`border-2 rounded-xl p-5 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="h-6 w-6 text-primary" />
                    <span className="font-bold text-foreground">
                      {t(translations.checkoutPage.cod)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(translations.checkoutPage.codDesc)}
                  </p>
                </button>
              </div>

              {/* COD confirmation */}
              {paymentMethod === "cod" && (
                <div className="mt-6 bg-accent border border-border rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm font-medium text-foreground">
                    You've selected Cash on Delivery. You will pay the total amount of {formatPrice(grandTotal)} upon arrival.
                  </p>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!isFormValid || isPlacingOrder}
                    className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                        {isPlacingOrder ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t(translations.checkoutPage.placingOrder || "Placing Order...")}
                          </>
                        ) : (
                          <>{t(translations.checkoutPage.confirmOrder)} {formatPrice(grandTotal)}</>
                        )}
                  </Button>
                </div>
              )}

              {/* MOMO form */}
              {paymentMethod === "momo" && (
                <div className="mt-6 bg-accent border border-border rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-semibold text-foreground text-sm font-heading">
                    {t(translations.checkoutPage.momoNumber)}
                  </h3>
                  <input
                    type="tel"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="078X XXX XXX"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t(translations.checkoutPage.momoInstruction)}
                  </p>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={
                      !isFormValid || isPlacingOrder || momoNumber.length < 10
                    }
                    className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t(translations.checkoutPage.placingOrder || "Placing Order...")}
                      </>
                    ) : (
                      <>{t(translations.checkoutPage.placeOrder)} {formatPrice(grandTotal)}</>
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
                    onClick={handlePlaceOrder}
                    disabled={!isFormValid || isPlacingOrder}
                    className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t(translations.checkoutPage.placingOrder || "Placing Order...")}
                      </>
                    ) : (
                      <> {t(translations.checkoutPage.placeOrder)} {formatPrice(grandTotal)}</>
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
                {t(translations.checkoutPage.orderSummary)}
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
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {quantity} × {formatPrice(product.price)} / {t(translations.checkoutPage.piece)}
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

              <div className="mt-6">
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                  {t(translations.checkoutPage.discountCode)}
                </label>
                <div className="flex gap-2">
                  <input
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      if (discountFeedback) setDiscountFeedback(null);
                    }}
                    placeholder={t(translations.checkoutPage.enterCode)}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    onClick={handleValidateDiscount}
                    disabled={!discountCode.trim() || isValidatingDiscount}
                    variant="outline"
                    className="h-11 px-4 font-bold"
                  >
                    {isValidatingDiscount ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t(translations.checkoutPage.apply)
                    )}
                  </Button>
                </div>
                {discountFeedback ? (
                  <div
                    className={`mt-2 rounded-md border px-3 py-2 text-xs ${
                      discountFeedback.type === "success"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {discountFeedback.message}
                  </div>
                ) : null}
              </div>

              <div className="border-t border-border mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(translations.cartPage.subtotal)}</span>
                  <span className="font-semibold text-foreground font-heading">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                {itemDiscounts > 0 && (
                  <div className="flex justify-between text-badge-sale">
                    <span>{t(translations.checkoutPage.retailDiscounts || "Retail Discounts Applied")}</span>
                    <span className="font-semibold">
                      -{formatPrice(itemDiscounts)}
                    </span>
                  </div>
                )}
                {appliedDiscount && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>{t(translations.checkoutPage.coupon || "Coupon")}: {appliedDiscount.code}</span>
                    <span className="font-semibold">
                      -{formatPrice(appliedDiscount.amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(translations.cartPage.shipping)}</span>
                  <span className="font-semibold text-foreground font-heading">
                    {shipping === 0 ? (
                      <span className="text-primary font-bold">{t(translations.checkoutPage.shippingDepends)}</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="border-t-2 border-dashed border-border pt-4 flex justify-between items-end">
                  <span className="font-bold text-foreground text-base">
                    {t(translations.cartPage.total)}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      {t(translations.checkoutPage.totalInclusive)}
                    </p>
                    <p className="font-bold text-primary text-2xl font-heading leading-tight">
                      {formatPrice(grandTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{t(translations.checkoutPage.safeCheckout)}</span>
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
