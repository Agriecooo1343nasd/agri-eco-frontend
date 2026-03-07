"use client";

import { useState } from "react";
import {
  User,
  Store,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
  Mail,
  Phone,
  Lock,
  Globe,
  Camera,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings Saved", {
        description: "Your administrative preferences have been updated.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Console Settings
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Configure your store identity, security, and personal preferences.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary text-white gap-2 transition-all hover:scale-105"
        >
          {isSaving ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : (
            <Save className="h-5 w-5" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-card p-1 rounded-2xl border border-border shadow-sm h-16 w-full sm:w-auto overflow-x-auto overflow-y-hidden">
          <TabsTrigger
            value="general"
            className="rounded-xl px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2"
          >
            <Store className="h-4 w-4" /> Store Info
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-xl px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2"
          >
            <User className="h-4 w-4" /> My Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-xl px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2"
          >
            <Bell className="h-4 w-4" /> Alerts
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-xl px-6 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2"
          >
            <Shield className="h-4 w-4" /> Registry
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="space-y-6 animate-in fade-in-50 duration-500 mt-0 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 rounded-[32px] border-border">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black font-heading">
                  Store Metadata
                </CardTitle>
                <CardDescription className="font-medium italic">
                  Public details that define your marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                      Store Name
                    </label>
                    <Input
                      defaultValue="Agri-Eco Organic Market"
                      className="rounded-xl border-border h-12 font-bold focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                      Store URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue="agrieco.market"
                        className="pl-10 rounded-xl border-border h-12 font-bold"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                      Official Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue="hello@agrieco.market"
                        className="pl-10 rounded-xl border-border h-12 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                      Customer Service Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue="+250 788 000 000"
                        className="pl-10 rounded-xl border-border h-12 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-border overflow-hidden">
              <div className="bg-primary/5 p-8 border-b border-border">
                <p className="text-xs font-black uppercase text-primary tracking-widest">
                  Regional Config
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-1 italic">
                  Currency & Localization
                </p>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    Default Currency
                  </label>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
                    <span className="font-bold">Rwandan Franc (RWF)</span>
                    <Badge className="bg-primary text-white font-black">
                      ACTIVE
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    System Language
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black">
                      EN
                    </span>
                    <span className="font-bold">English (US)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="profile"
          className="animate-in slide-in-from-bottom-5 duration-500 mt-0 focus-visible:outline-none"
        >
          <Card className="rounded-[32px] border-border overflow-hidden">
            <div className="bg-primary h-32 w-full relative">
              <div className="absolute -bottom-12 left-12 w-24 h-24 rounded-[28px] border-4 border-white bg-muted overflow-hidden shadow-xl group">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=047857&color=fff&size=200"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="text-white h-6 w-6" />
                </div>
              </div>
            </div>
            <CardContent className="p-12 pt-16 space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                      Personal Full Name
                    </label>
                    <Input
                      defaultValue="Agri-Eco Super Admin"
                      className="rounded-xl border-border h-12 font-bold focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                      Access Role
                    </label>
                    <Input
                      defaultValue="Super Administrator"
                      disabled
                      className="rounded-xl border-border h-12 bg-muted/30 font-bold opacity-70"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                      Admin Email Access
                    </label>
                    <Input
                      defaultValue="admin@agrieco.com"
                      className="rounded-xl border-border h-12 font-bold focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64 p-6 rounded-[28px] bg-muted/20 border border-border space-y-4">
                  <p className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Account Status
                  </p>
                  <div className="space-y-1">
                    <p className="text-lg font-black font-heading leading-tight">
                      Verified Console
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground leading-tight">
                      Member since January 2024
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-11 border-primary/20 text-primary font-black text-xs hover:bg-primary/10"
                  >
                    View Log History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="animate-in fade-in-50 duration-500 mt-0 focus-visible:outline-none"
        >
          <Card className="rounded-[32px] border-border">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black font-heading tracking-tight">
                System Notifications
              </CardTitle>
              <CardDescription className="font-medium italic">
                Control how you receive alerts and system updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {[
                {
                  title: "New Order Placement",
                  desc: "Receive immediate alerts for every new order arriving in the console.",
                  default: true,
                },
                {
                  title: "Inventory Low Stock Alerts",
                  desc: "Get notified when product stock levels fall below the threshold.",
                  default: true,
                },
                {
                  title: "New Member Invitations",
                  desc: "Receive alerts when a new administrator joins the team.",
                  default: false,
                },
                {
                  title: "Daily Sales Summary",
                  desc: "Automated daily report of total revenue and products sold.",
                  default: true,
                },
                {
                  title: "Critical System Notifications",
                  desc: "Receive maintenance updates and security audit reports.",
                  default: true,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-2xl hover:bg-muted/10 transition-colors border border-transparent hover:border-border"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{item.title}</p>
                    <p className="text-xs font-medium text-muted-foreground italic leading-tight max-w-sm">
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    defaultChecked={item.default}
                    className="data-[state=checked]:bg-primary shadow-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="security"
          className="animate-in slide-in-from-right-5 duration-500 mt-0 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[32px] border-border">
              <CardHeader className="p-8">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle className="text-xl font-black font-heading tracking-tight">
                  Security Credentials
                </CardTitle>
                <CardDescription className="font-medium italic">
                  Update your authentication keys to keep the console secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    className="rounded-xl border-border h-12 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">
                    Confirm Identity
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    className="rounded-xl border-border h-12 focus:ring-primary/20"
                  />
                </div>
                <Button className="w-full h-12 rounded-xl bg-black text-white font-black text-sm hover:bg-zinc-800 transition-all mt-4">
                  Rotate Security Keys
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-border bg-zinc-900 border-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-50" />
              <CardHeader className="p-8 relative z-10 text-white">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                  <SettingsIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-black font-heading tracking-tight">
                  Registry Management
                </CardTitle>
                <CardDescription className="text-zinc-400 font-medium italic">
                  Advanced operations and console cleanup.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4 relative z-10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">
                    Database Sync
                  </p>
                  <p className="text-sm font-medium text-zinc-500 italic leading-tight">
                    Last sync was successful 14 minutes ago.
                  </p>
                  <Button
                    variant="ghost"
                    className="h-8 rounded-lg text-primary hover:bg-primary/10 font-bold p-0 text-xs"
                  >
                    Force Re-index Products
                  </Button>
                </div>
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-3 mt-6">
                  <p className="text-xs font-black uppercase text-rose-500 tracking-widest">
                    Danger Zone
                  </p>
                  <p className="text-sm font-medium text-rose-400 italic leading-tight">
                    These operations are permanent and irreversible.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl h-11 bg-rose-600 font-black text-xs hover:bg-rose-700"
                  >
                    Clear Console Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
