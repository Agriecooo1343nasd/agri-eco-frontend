"use client";

import { useState } from "react";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Save,
  Key,
  Globe,
  Camera,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState("profile");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading mb-2">
            Account Settings
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage your personal information, security, and preferences.
          </p>
        </div>
      </div>

      {/* Settings Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-white border border-border rounded-2xl w-fit">
        {[
          { id: "profile", label: "Profile Information", icon: User },
          {
            id: "security",
            label: "Security & Password",
            icon: Shield,
          },
          {
            id: "preferences",
            label: "System Preferences",
            icon: Globe,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all
              ${
                activeSubTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Profile Form Card */}
        <div className="xl:col-span-8 bg-white rounded-[32px] border border-border p-8 shadow-sm">
          {activeSubTab === "profile" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center ring-4 ring-primary/5 overflow-hidden">
                    <span className="text-4xl font-black text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white hover:scale-110 transition-transform">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Upload Profile Image
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <Input
                    defaultValue={user?.name || ""}
                    className="h-14 rounded-xl bg-muted/20 border-border focus:bg-white focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <Input
                    defaultValue={user?.email || ""}
                    className="h-14 rounded-xl bg-muted/20 border-border focus:bg-white focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <Input
                    defaultValue="+250 788 000 000"
                    className="h-14 rounded-xl bg-muted/20 border-border focus:bg-white focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    User Segment
                  </label>
                  <div className="h-14 rounded-xl bg-muted/20 border border-border flex items-center px-4 text-sm font-black text-primary uppercase">
                    Organic Enthusiast
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button className="rounded-xl h-12 px-8 font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeSubTab === "security" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-red-50 border border-red-100 rounded-[28px] p-6 flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Key className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h4 className="text-red-900 font-bold mb-1">
                    Stronger Security
                  </h4>
                  <p className="text-red-700/80 text-sm font-medium leading-relaxed max-w-lg">
                    Using a strong, unique password helps you keep your Agri-Eco
                    account safe from unauthorized access.
                  </p>
                </div>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-xl bg-muted/20 border-border focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-xl bg-muted/20 border-border focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-14 rounded-xl bg-muted/20 border-border focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button className="rounded-xl h-12 px-8 font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
                  <Shield className="h-4 w-4" />
                  Update Password
                </Button>
              </div>
            </div>
          )}

          {activeSubTab === "preferences" && (
            <div className="space-y-8 animate-in fade-in duration-300 py-4 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Preferences Coming Soon
              </h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                Soon you will be able to manage your currency settings, language
                preferences, and newsletter notifications here.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-primary overflow-hidden rounded-[32px] text-white p-8 relative shadow-2xl">
            <div className="relative z-10">
              <SettingsIcon className="h-12 w-12 text-white/20 mb-6 animate-spin-slow" />
              <h3 className="text-xl font-black mb-3 font-heading">
                Control Your Privacy
              </h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                We take your data privacy seriously. Your information is
                encrypted and never shared with third parties.
              </p>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-[32px] border border-border p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground font-heading mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Email Alerts
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  Order Updates
                </span>
                <div className="w-10 h-5 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  Promo Coupons
                </span>
                <div className="w-10 h-5 bg-muted rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
