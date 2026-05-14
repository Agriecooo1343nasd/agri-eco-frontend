"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
  Check,
  AlertTriangle,
  ShoppingBag,
  GraduationCap,
  MapPin,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  fetchAllSettings, 
  updateSettings, 
  updateFeatureFlag, 
  fetchFeatureFlags,
  type FeatureKey,
  type GroupedSettings
} from "@/lib/api/settings";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("system");

  // Fetch all settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchAllSettings,
  });

  // Fetch feature flags explicitly for the System tab
  const { data: features, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: fetchFeatureFlags,
  });

  // Mutation for feature flags
  const toggleFeatureMutation = useMutation({
    mutationFn: ({ feature, enabled }: { feature: FeatureKey; enabled: boolean }) => 
      updateFeatureFlag(feature, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("System feature updated");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update feature";
    },
  });

  // Mutation for general settings
  const updateSettingsMutation = useMutation({
    mutationFn: (payload: Array<{ key: string; value: any }>) => updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; feature: FeatureKey | null; newState: boolean | null }>({ isOpen: false, feature: null, newState: null });

  const handleToggleClick = (feature: FeatureKey, enabled: boolean) => {
    setConfirmDialog({ isOpen: true, feature, newState: enabled });
  };

  const confirmToggle = () => {
    if (confirmDialog.feature && confirmDialog.newState !== null) {
      toggleFeatureMutation.mutate({ feature: confirmDialog.feature, enabled: confirmDialog.newState });
    }
    setConfirmDialog({ isOpen: false, feature: null, newState: null });
  };

  if (isLoadingSettings || isLoadingFeatures) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const featureConfigs: Record<FeatureKey, { label: string; icon: any; description: string }> = {
    shopping: {
      label: "Shopping & E-commerce",
      icon: ShoppingBag,
      description: "Manage product listings, cart, and checkout processes.",
    },
    training: {
      label: "Training Programs",
      icon: GraduationCap,
      description: "Manage educational courses and student enrollments.",
    },
    tours: {
      label: "Tours & Experiences",
      icon: MapPin,
      description: "Manage tour bookings, slots, and tourist experiences.",
    },
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-heading tracking-tight uppercase flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          System Configuration
        </h1>
        <p className="text-muted-foreground font-medium">
          Manage global feature toggles, site preferences, and security policies.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12">
          <TabsTrigger value="system" className="rounded-lg h-10 px-6 font-bold text-xs uppercase tracking-widest">
            <Shield className="h-4 w-4 mr-2" /> System Control
          </TabsTrigger>
          <TabsTrigger value="general" className="rounded-lg h-10 px-6 font-bold text-xs uppercase tracking-widest">
            <Store className="h-4 w-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg h-10 px-6 font-bold text-xs uppercase tracking-widest">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg h-10 px-6 font-bold text-xs uppercase tracking-widest">
            <Shield className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(featureConfigs) as FeatureKey[]).map((key) => {
              const config = featureConfigs[key];
              const isEnabled = features?.[key] ?? true;
              const isPending = toggleFeatureMutation.isPending && toggleFeatureMutation.variables?.feature === key;

              return (
                <Card key={key} className={cn(
                  "border-2 transition-all duration-300 overflow-hidden group",
                  isEnabled ? "border-primary/10 bg-card" : "border-border bg-muted/30 grayscale-[0.5]"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-3 rounded-2xl transition-colors",
                        isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <config.icon className="h-6 w-6" />
                      </div>
                      <Switch 
                        checked={isEnabled} 
                        onCheckedChange={(val) => handleToggleClick(key, val)}
                        disabled={isPending}
                      />
                    </div>
                    <CardTitle className="mt-4 text-sm font-black uppercase tracking-tight">{config.label}</CardTitle>
                    <CardDescription className="text-xs font-medium leading-relaxed">
                      {config.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={isEnabled ? "default" : "secondary"} className="rounded-md h-6 font-black text-[9px] uppercase tracking-widest">
                        {isEnabled ? "Online" : "Disabled"}
                      </Badge>
                      {isPending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-tight text-amber-700">Safety Precautions</CardTitle>
                <CardDescription className="text-xs text-amber-600 font-medium">
                  Disabling core features requires no active dependencies (pending orders, upcoming tours, or active enrollments).
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        {["general", "notifications", "security"].map((group) => (
          <TabsContent key={group} value={group}>
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-tight capitalize">{group} Settings</CardTitle>
                <CardDescription className="text-xs font-medium">
                  Configure the fundamental parameters for the {group} module.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings && settings[group] && Object.entries(settings[group]).map(([key, setting]: [string, any]) => (
                  <div key={key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">{setting.label}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono font-bold uppercase">{key}</p>
                    </div>
                    <div className="w-full md:w-80">
                      {setting.type === "boolean" ? (
                        <Switch 
                          checked={setting.value} 
                          onCheckedChange={(val) => {
                            updateSettingsMutation.mutate([{ key, value: val }]);
                          }}
                        />
                      ) : (
                        <div className="relative group">
                          <Input 
                            defaultValue={setting.value}
                            className="h-10 text-xs font-medium rounded-lg"
                            onBlur={(e) => {
                              if (e.target.value !== String(setting.value)) {
                                updateSettingsMutation.mutate([{ key, value: e.target.value }]);
                              }
                            }}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Save className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog 
        open={confirmDialog.isOpen} 
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ isOpen: false, feature: null, newState: null });
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-xl font-black font-heading text-center">
              Confirm Feature Action
            </DialogTitle>
            <DialogDescription className="text-center font-medium leading-relaxed">
              Are you sure you want to {confirmDialog.newState ? "enable" : "disable"} the 
              <span className="font-bold text-foreground mx-1">
                {confirmDialog.feature ? featureConfigs[confirmDialog.feature].label : ""}
              </span>
              feature?
              <br/><br/>
              <span className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded-md block">
                {confirmDialog.newState 
                  ? "This will make the feature visible to all users across the platform." 
                  : "Disabling this feature will immediately hide all related routes, navigation links, and modules. Make sure there are no pending critical tasks (e.g. ongoing orders)."}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialog({ isOpen: false, feature: null, newState: null })}
              className="w-full sm:w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmDialog.newState ? "default" : "destructive"}
              onClick={confirmToggle}
              disabled={toggleFeatureMutation.isPending}
              className="w-full sm:w-1/2 font-bold"
            >
              {toggleFeatureMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {confirmDialog.newState ? "Yes, Enable" : "Yes, Disable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
