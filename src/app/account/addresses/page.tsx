"use client";

import { useState } from "react";
import { Plus, MapPin, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockAddresses = [
  {
    id: 1,
    type: "Shipping",
    name: "John Doe",
    street: "KN 123 St, Muhima",
    city: "Kigali City",
    country: "Rwanda",
    phone: "+250 788 000 000",
    isDefault: true,
  },
  {
    id: 2,
    type: "Business",
    name: "Agri-Eco Office",
    street: "KG 543 St, Kacyiru",
    city: "Kigali City",
    country: "Rwanda",
    phone: "+250 788 111 222",
    isDefault: false,
  },
];

const AddressesPage = () => {
  const [addresses, setAddresses] = useState(mockAddresses);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading mb-2">
            My Addresses
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage your shipping and billing locations for faster checkout.
          </p>
        </div>
        <Button className="rounded-2xl h-12 px-6 font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="bg-white rounded-[32px] border border-border p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            {address.isDefault && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                  Default
                </div>
              </div>
            )}

            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/5">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {address.name}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-muted rounded-lg text-[10px] font-black text-muted-foreground uppercase">
                    {address.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {address.street}
                  <br />
                  {address.city}, {address.country}
                  <br />
                  Phone: {address.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-border">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 font-bold border-border hover:bg-muted/50 text-foreground"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-11 px-4 border-border hover:bg-red-50 hover:text-red-500 hover:border-red-100 group-hover:border-border/60 transition-colors"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-primary/5 border border-primary/10 rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-soft flex items-center justify-center shrink-0 animate-bounce">
          <Plus className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-foreground mb-2">
            Need a different location?
          </h4>
          <p className="text-muted-foreground font-medium max-w-lg leading-relaxed">
            You can add multiple addresses to your account. This makes it easier
            to send gifts to friends or order directly to your office.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressesPage;
