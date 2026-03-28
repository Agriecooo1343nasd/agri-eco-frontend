"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Key,
  Globe,
  Loader2,
  MailWarning,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState("security");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      toast.error("Password must contain an uppercase letter, lowercase letter, and a number.");
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsUpdating(true);
      await apiClient.patch("/users/change-password", passwordForm);
      toast.success("Password successfully updated.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to change password. Please verify current password.";
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user?.email) {
      toast.error("Logged in session required to unsubscribe.");
      return;
    }

    try {
      await apiClient.post("/newsletter/unsubscribe", { email: user.email });
      toast.success("Successfully unsubscribed from the newsletter.");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to unsubscribe. You might not be subscribed.";
      toast.error(msg);
    }
  };

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
      <div className="flex flex-wrap items-center gap-2 p-1 bg-white border border-border rounded-md w-fit">
        {[
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
              flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold transition-all
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
        {/* Form Card */}
        <div className="xl:col-span-8 bg-white rounded-md border border-border p-8 shadow-sm">
          {activeSubTab === "security" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-red-50 border border-red-100 rounded-[28px] p-6 flex gap-4">
                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center shrink-0 shadow-sm">
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
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className=" rounded-md bg-muted/20 border-border focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className=" rounded-md bg-muted/20 border-border focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="rounded-md bg-muted/20 border-border focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button 
                  className="rounded-md h-12 px-8 font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                  onClick={handlePasswordChange}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Update Password
                </Button>
              </div>
            </div>
          )}

          {activeSubTab === "preferences" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-100 rounded-[28px] p-6 flex gap-4">
                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center shrink-0 shadow-sm">
                  <MailWarning className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-amber-900 font-bold mb-1">
                    Newsletter Preferences
                  </h4>
                  <p className="text-amber-700/80 text-sm font-medium leading-relaxed max-w-lg">
                    Manage your email subscription status. You are currently authenticated as <strong>{user?.email}</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-foreground mb-1">Unsubscribe</h4>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Opt-out from receiving our latest deals, news, and organic recipes directly in your inbox.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="rounded-md h-10 px-6 font-bold flex items-center gap-2 shadow-lg shadow-destructive/20 outline-none">
                      <MailWarning className="h-4 w-4" />
                      Unsubscribe
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will immediately remove <strong>{user?.email}</strong> from our newsletter mailing list. 
                        You will stop receiving special deals, newsletters, and organic recipes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUnsubscribe} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, Unsubscribe
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-primary overflow-hidden rounded-md text-white p-8 relative shadow-2xl">
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

          <div className="bg-white rounded-md border border-border p-8 shadow-sm">
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
