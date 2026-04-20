"use client";

import { useState } from "react";
import { Plus, MapPin, Pencil, Trash, Loader2, AlertCircle, Home, Briefcase, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyAddresses, addAddress, updateAddress, removeAddress, setDefaultAddress, type UserAddress } from "@/lib/api/user";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const AddressesPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [formData, setFormData] = useState<Partial<UserAddress>>({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Rwanda",
    isDefault: false,
  });

  const addressesQuery = useQuery({
    queryKey: ["user-addresses"],
    queryFn: fetchMyAddresses,
  });

  const addMutation = useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["customer-dashboard"] });
      toast.success(t(translations.common.success));
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add address");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserAddress> }) => updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      toast.success(t(translations.common.success));
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update address");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: removeAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["customer-dashboard"] });
      toast.success(t(translations.common.success));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove address");
    },
  });

  const setAsDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      toast.success(t(translations.common.success));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to set default");
    },
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      label: "Home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Rwanda",
      isDefault: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  const getLabelIcon = (label?: string) => {
    const l = label?.toLowerCase();
    if (l === "home") return <Home className="h-5 w-5" />;
    if (l === "office" || l === "work") return <Briefcase className="h-5 w-5" />;
    return <Building2 className="h-5 w-5" />;
  };

  if (addressesQuery.isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">{t(translations.common.loading)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading mb-2">
            {t(translations.addressesPage.myAddresses)}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            {t(translations.addressesPage.manageAddresses)}
          </p>
        </div>
        <Button onClick={handleOpenAdd} >
          <Plus className="h-4 w-4" />
          {t(translations.addressesPage.addNewAddress)}
        </Button>
      </div>

      {addressesQuery.data?.length === 0 ? (
        <div className="py-20 bg-muted/20 border-2 border-dashed border-border/60 rounded-3xl flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <MapPin className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-bold">{t(translations.addressesPage.noAddressesFound)}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{t(translations.addressesPage.noAddressesDescription)}</p>
            </div>
            <Button onClick={handleOpenAdd} variant="outline" size="sm" className="mt-2 font-bold uppercase tracking-widest text-[10px]">
                {t(translations.addressesPage.createFirstAddress)}
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addressesQuery.data?.map((address) => (
            <div
                key={address.id}
                className={cn(
                    "bg-white rounded-2xl border p-8 transition-all group relative overflow-hidden",
                    address.isDefault ? "border-primary shadow-md shadow-primary/5" : "border-border/60 hover:border-primary/40 hover:shadow-sm"
                )}
            >
                {address.isDefault && (
                <div className="absolute top-0 right-0">
                    <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        {t(translations.addressesPage.default)}
                    </div>
                </div>
                )}

                <div className="flex items-start gap-5 mb-6">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors",
                    address.isDefault ? "bg-primary/10 border-primary/10 text-primary" : "bg-muted/30 border-border/40 text-muted-foreground/60"
                )}>
                    {getLabelIcon(address.label)}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-black font-heading text-foreground">
                        {address.label}
                    </h3>
                    {!address.isDefault && (
                        <button 
                            onClick={() => setAsDefaultMutation.mutate(address.id)}
                            className="text-[9px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
                        >
                            {t(translations.addressesPage.setAsDefault)}
                        </button>
                    )}
                    </div>
                    <div className="space-y-1 text-sm font-medium text-muted-foreground leading-relaxed italic">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p className="font-bold text-foreground/70 not-italic">{address.country}</p>
                    </div>
                </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-border/40">
                <Button
                    variant="outline"
                    className="flex-1 rounded-md h-11 font-black uppercase tracking-widest text-[10px] border-border/60 hover:bg-muted/50 text-foreground"
                    onClick={() => handleOpenEdit(address)}
                >
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    {t(translations.addressesPage.edit)}
                </Button>
                <Button
                    variant="outline"
                    className="rounded-md h-11 px-4 border-border/60 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                    onClick={() => {
                        if (confirm(t(translations.addressesPage.sureDelete))) {
                            deleteMutation.mutate(address.id);
                        }
                    }}
                    disabled={deleteMutation.isPending && deleteMutation.variables === address.id}
                >
                    {deleteMutation.isPending && deleteMutation.variables === address.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                </Button>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Benefits Card */}
      <div className="bg-primary overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/20 animate-pulse">
          <Plus className="h-10 w-10 text-white" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h4 className="text-xl font-black text-white font-heading mb-2 uppercase tracking-tight">
            Seamless Logistics
          </h4>
          <p className="text-white/70 text-sm font-medium max-w-lg leading-relaxed">
            Register your frequent locations to enjoy instant checkouts and precise tour pickups. We support multiple addresses for home, office, and travel hubs.
          </p>
        </div>
      </div>

      {/* Address Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-primary h-2 w-full" />
          <div className="p-8 pb-0">
            <DialogHeader className="mb-8">
                <DialogTitle className="text-2xl font-black font-heading tracking-tight">
                    {editingAddress ? t(translations.addressesPage.updateLocation) : t(translations.addressesPage.newAddress)}
                </DialogTitle>
                <DialogDescription className="font-medium text-muted-foreground italic">
                    {editingAddress ? t({ en: "Modify your existing address details below.", rw: "Hindura amakuru ya aderesi yawe hano.", fr: "Modifiez vos adresses existantes ci-dessous.", sw: "Badilisha maelezo yako ya anwani yaliyopo hapo chini." }) : t({ en: "Enter the details for your new delivery or pickup location.", rw: "Uzuza ibya aderesi nshya.", fr: "Saisissez les détails de votre nouveau lieu de livraison ou d'enlèvement.", sw: "Ingiza maelezo ya eneo lako jipya la utoaji ama kuchukua." })}
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t(translations.addressesPage.label)}</Label>
                        <Input
                            id="label"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="h-11 rounded-md bg-muted/20 border-border/40 focus:bg-white transition-all font-medium"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="street" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t(translations.addressesPage.streetAddress)}</Label>
                    <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="h-11 rounded-md bg-muted/20 border-border/40 focus:bg-white transition-all font-medium"
                        placeholder="House number and street name"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t(translations.addressesPage.city)}</Label>
                        <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            placeholder="Enter your city"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t(translations.addressesPage.state)}</Label>
                        <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            required
                            placeholder="Enter your state"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t(translations.addressesPage.zipCode)}</Label>
                        <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            placeholder="Enter zipcode"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t(translations.addressesPage.country)}</Label>
                        <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            required
                            placeholder="Enter your country"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input 
                        type="checkbox" 
                        id="isDefault" 
                        id-unique="addr-default-check"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 rounded text-primary border-border active:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isDefault" className="text-xs font-bold text-foreground cursor-pointer select-none uppercase tracking-tighter">
                        {t(translations.addressesPage.setAsDefault)}
                    </label>
                </div>

                <DialogFooter className="pt-4 pb-8 flex flex-col sm:flex-row gap-3">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsDialogOpen(false)}
                    >
                        {t(translations.common.cancel)}
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {editingAddress ? t(translations.addressesPage.saveChanges) : t(translations.addressesPage.createAddress)}
                    </Button>
                </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressesPage;
