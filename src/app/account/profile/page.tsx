"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/lib/api/user";

export default function Profile() {
  const { user, setAuthSession, tokens } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    location: "",
    bio: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        phone: user.phone || "",
        location: (user as any).location || "",
        bio: (user as any).bio || "",
        firstName: (user as any).firstName || "",
        lastName: (user as any).lastName || "",
      });
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully");
      // Update the auth context with the new user data
      if (tokens) {
        setAuthSession({
            user: updatedUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    profileMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
            <User className="h-4 w-4 text-primary" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {/* Avatar section */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl font-black text-primary border-2 border-primary/5 shadow-inner">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-110">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-black text-foreground text-xl font-heading">
                {user?.username}
              </h3>
              <div className="flex gap-2 mt-1.5">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
                    {user?.role || "Member"}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground bg-muted/30 border-transparent">
                    Active Account
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="pl-10 h-11 bg-muted/10 border-border/60 focus:bg-white transition-all text-sm font-medium"
                  placeholder="e.g. John"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="pl-10 h-11 bg-muted/10 border-border/60 focus:bg-white transition-all text-sm font-medium"
                  placeholder="e.g. Doe"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="pl-10 h-11 bg-muted/10 border-border/60 focus:bg-white transition-all text-sm font-medium"
                  placeholder="e.g. johndoe"
                />
              </div>
            </div>
            <div className="space-y-2.5 opacity-60 cursor-not-allowed">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address (Locked)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={user?.email || ""}
                  disabled
                  className="pl-10 h-11 bg-muted/50 border-dashed text-sm font-medium italic"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="pl-10 h-11 bg-muted/10 border-border/60 focus:bg-white transition-all text-sm font-medium"
                  placeholder="+250 ..."
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="pl-10 h-11 bg-muted/10 border-border/60 focus:bg-white transition-all text-sm font-medium"
                  placeholder="e.g. Kigali, Rwanda"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personal Bio</Label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium resize-none min-h-[120px]"
              placeholder="Tell us a bit about your interest in sustainable agriculture..."
            />
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-end">
            <Button 
                onClick={handleSave} 
                disabled={profileMutation.isPending}
            >
              {profileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {profileMutation.isPending ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
