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
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const SettingsPage = () => {
  const { t } = useLanguage();
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
      toast.error(t({ en: "Please enter your current password.", rw: "Andika ijambo ry'ibanga rya none.", fr: "Veuillez saisir votre mot de passe actuel.", sw: "Tafadhali ingiza nywila yako ya sasa." }));
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error(t({ en: "New password must be at least 8 characters.", rw: "Ijambo ry'ibanga rishya rigomba kuba rifite inyuguti 8.", fr: "Le nouveau mot de passe doit comporter au moins 8 caractères.", sw: "Nywila mpya lazima iwe na angalau herufi 8." }));
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      toast.error(t({ en: "Password must contain an uppercase letter, lowercase letter, and a number.", rw: "Ijambo ry'ibanga rigomba kuba rifite inyuguti nkuru, nto, n'umubare.", fr: "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.", sw: "Nywila lazima iwe na herufi kubwa, herufi ndogo, na nambari." }));
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t({ en: "Passwords do not match.", rw: "Amagambo y'ibanga ntahuye.", fr: "Les mots de passe ne correspondent pas.", sw: "Nywila hazilingani." }));
      return;
    }

    try {
      setIsUpdating(true);
      await apiClient.patch("/users/change-password", passwordForm);
      toast.success(t(translations.common.success));
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
      toast.error(t(translations.auth.required));
      return;
    }

    try {
      await apiClient.post("/newsletter/unsubscribe", { email: user.email });
      toast.success(t(translations.common.success));
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
            {t(translations.settingsPage.accountSettings)}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t(translations.settingsPage.manageSettings)}
          </p>
        </div>
      </div>

      {/* Settings Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-white border border-border rounded-md w-fit">
        {[
          {
            id: "security",
            label: t(translations.settingsPage.securityPassword),
            icon: Shield,
          },
          {
            id: "preferences",
            label: t(translations.settingsPage.systemPreferences),
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
                    {t(translations.settingsPage.strongerSecurity)}
                  </h4>
                  <p className="text-red-700/80 text-sm font-medium leading-relaxed max-w-lg">
                    {t(translations.settingsPage.securityDescription)}
                  </p>
                </div>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    {t(translations.settingsPage.currentPassword)}
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
                    {t(translations.settingsPage.newPassword)}
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
                    {t(translations.settingsPage.confirmNewPassword)}
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
                  {t(translations.settingsPage.updatePassword)}
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
                    {t(translations.settingsPage.newsletterPreferences)}
                  </h4>
                  <p className="text-amber-700/80 text-sm font-medium leading-relaxed max-w-lg">
                    {t({ en: "Manage your email subscription status. You are currently authenticated as", rw: "Icunga uburyo ubanamo amakuru kuri imeri. Winjiye nka", fr: "Gérez votre statut d'abonnement par e-mail. Vous êtes actuellement authentifié en tant que", sw: "Simamia hali yako ya usajili wa barua pepe. Kwa sasa umethibitishwa kama" })} <strong>{user?.email}</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-foreground mb-1">{t(translations.settingsPage.unsubscribe)}</h4>
                  <p className="text-muted-foreground text-sm max-width-md">
                    {t(translations.settingsPage.unsubscribeDescription)}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="rounded-md h-10 px-6 font-bold flex items-center gap-2 shadow-lg shadow-destructive/20 outline-none">
                      <MailWarning className="h-4 w-4" />
                      {t(translations.settingsPage.unsubscribe)}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t(translations.settingsPage.areYouSure)}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t(translations.settingsPage.unsubConfirmDescription)} <strong>{user?.email}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t(translations.common.cancel)}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUnsubscribe} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t(translations.settingsPage.yesUnsubscribe)}
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
                {t(translations.settingsPage.controlPrivacy)}
              </h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                {t(translations.settingsPage.privacyDescription)}
              </p>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-md border border-border p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground font-heading mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t({ en: "Email Alerts", rw: "Ibiburira kuri imeri", fr: "Alertes e-mail", sw: "Tahadhari za Barua Pepe" })}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  {t({ en: "Order Updates", rw: "Ibyerekeye ama-odari", fr: "Mises à jour des commandes", sw: "Sasisho za Agizo" })}
                </span>
                <div className="w-10 h-5 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  {t({ en: "Promo Coupons", rw: "Kuponi", fr: "Coupons promotionnels", sw: "Kuponi za Matangazo" })}
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
