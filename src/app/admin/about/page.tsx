"use client";

import { useState, useMemo, ChangeEvent } from "react";
import {
  Users,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Mail,
  Phone,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createGalleryImage,
  createTeamMember,
  getAboutGalleryImages,
  getAboutTeamMembers,
  saveAboutGalleryImages,
  saveAboutTeamMembers,
} from "@/lib/about-store";
import type { AboutGalleryImage, AboutTeamMember } from "@/data/site";

export default function AdminAboutPage() {
  const [team, setTeam] = useState<AboutTeamMember[]>(() =>
    getAboutTeamMembers(),
  );
  const [gallery, setGallery] = useState<AboutGalleryImage[]>(() =>
    getAboutGalleryImages(),
  );

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AboutTeamMember | null>(
    null,
  );
  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "",
    image: "",
    bio: "",
    email: "",
    phone: "",
  });

  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<AboutGalleryImage | null>(
    null,
  );
  const [galleryForm, setGalleryForm] = useState({
    url: "",
    caption: "",
  });

  const [teamPage, setTeamPage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);

  const TEAM_PAGE_SIZE = 6;
  const GALLERY_PAGE_SIZE = 8;

  const totalContacts = useMemo(
    () => team.filter((m) => m.email || m.phone).length,
    [team],
  );

  const totalTeamPages = Math.max(
    1,
    Math.ceil(team.length / TEAM_PAGE_SIZE),
  );
  const totalGalleryPages = Math.max(
    1,
    Math.ceil(gallery.length / GALLERY_PAGE_SIZE),
  );

  const paginatedTeam = useMemo(() => {
    const start = (teamPage - 1) * TEAM_PAGE_SIZE;
    return team.slice(start, start + TEAM_PAGE_SIZE);
  }, [team, teamPage]);

  const paginatedGallery = useMemo(() => {
    const start = (galleryPage - 1) * GALLERY_PAGE_SIZE;
    return gallery.slice(start, start + GALLERY_PAGE_SIZE);
  }, [gallery, galleryPage]);

  const openNewMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: "",
      role: "",
      image: "",
      bio: "",
      email: "",
      phone: "",
    });
    setTeamDialogOpen(true);
    setTeamPage(1);
  };

  const openEditMember = (member: AboutTeamMember) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      role: member.role,
      image: member.image,
      bio: member.bio,
      email: member.email ?? "",
      phone: member.phone ?? "",
    });
    setTeamDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!memberForm.name.trim() || !memberForm.role.trim()) {
      toast.error("Name and role are required for team members.");
      return;
    }

    if (!memberForm.image.trim()) {
      toast.error("Please provide a profile image URL.");
      return;
    }

    if (!memberForm.bio.trim()) {
      toast.error("Please add a short bio to describe this team member.");
      return;
    }

    let nextTeam: AboutTeamMember[];
    if (editingMember) {
      nextTeam = team.map((member) =>
        member.id === editingMember.id
          ? {
              ...member,
              name: memberForm.name.trim(),
              role: memberForm.role.trim(),
              image: memberForm.image.trim(),
              bio: memberForm.bio.trim(),
              email: memberForm.email.trim() || undefined,
              phone: memberForm.phone.trim() || undefined,
            }
          : member,
      );
      toast.success("Team member updated.");
    } else {
      const created = createTeamMember({
        name: memberForm.name.trim(),
        role: memberForm.role.trim(),
        image: memberForm.image.trim(),
        bio: memberForm.bio.trim(),
        email: memberForm.email.trim() || undefined,
        phone: memberForm.phone.trim() || undefined,
      });
      nextTeam = [created, ...team];
      toast.success("Team member added to About page.");
    }

    setTeam(nextTeam);
    saveAboutTeamMembers(nextTeam);
    setTeamDialogOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    const remaining = team.filter((member) => member.id !== id);
    setTeam(remaining);
    saveAboutTeamMembers(remaining);
    toast.success("Team member removed from About page.");
  };

  const openNewImage = () => {
    setEditingImage(null);
    setGalleryForm({
      url: "",
      caption: "",
    });
    setGalleryDialogOpen(true);
    setGalleryPage(1);
  };

  const openEditImage = (image: AboutGalleryImage) => {
    setEditingImage(image);
    setGalleryForm({
      url: image.url,
      caption: image.caption ?? "",
    });
    setGalleryDialogOpen(true);
  };

  const handleSaveImage = () => {
    if (!galleryForm.url.trim()) {
      toast.error("Image URL is required for gallery items.");
      return;
    }

    let nextGallery: AboutGalleryImage[];
    if (editingImage) {
      nextGallery = gallery.map((image) =>
        image.id === editingImage.id
          ? {
              ...image,
              url: galleryForm.url.trim(),
              caption: galleryForm.caption.trim() || undefined,
            }
          : image,
      );
      toast.success("Gallery image updated.");
    } else {
      const created = createGalleryImage({
        url: galleryForm.url.trim(),
        caption: galleryForm.caption.trim() || undefined,
      });
      nextGallery = [created, ...gallery];
      toast.success("Image added to About gallery.");
    }

    setGallery(nextGallery);
    saveAboutGalleryImages(nextGallery);
    setGalleryDialogOpen(false);
    setEditingImage(null);
  };

  const handleDeleteImage = (id: string) => {
    const remaining = gallery.filter((image) => image.id !== id);
    setGallery(remaining);
    saveAboutGalleryImages(remaining);
    toast.success("Gallery image removed.");
  };

  const handleMemberImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setMemberForm((prev) => ({ ...prev, image: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setGalleryForm((prev) => ({ ...prev, url: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            About Page Content
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Manage the people and farm gallery that appear on the public
            About page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border lg:col-span-2">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-black font-heading">
                The People Behind The Produce
              </CardTitle>
              <CardDescription>
                These team members are shown on the About page team section.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={openNewMember}
            >
              <Plus className="h-4 w-4" /> Add Member
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            {paginatedTeam.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl">
                <Users className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-bold text-sm">
                  No team members configured yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Use &quot;Add Member&quot; to feature your core team on the
                  About page.
                </p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {paginatedTeam.map((member) => (
                  <div
                    key={member.id}
                    className="min-w-[240px] max-w-[260px] bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                      <div>
                        <p className="text-sm font-black font-heading leading-tight">
                          {member.name}
                        </p>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-widest mt-1">
                          {member.role}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-3">
                        {member.bio}
                      </p>
                      {(member.email || member.phone) && (
                        <div className="flex flex-col gap-1 mt-1">
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Mail className="h-3 w-3 text-primary" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{member.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-2 pt-3 mt-auto">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => openEditMember(member)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {team.length > TEAM_PAGE_SIZE && (
              <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-foreground">
                <p>
                  Page {teamPage} of {totalTeamPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[11px]"
                    disabled={teamPage <= 1}
                    onClick={() =>
                      setTeamPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[11px]"
                    disabled={teamPage >= totalTeamPages}
                    onClick={() =>
                      setTeamPage((prev) =>
                        Math.min(totalTeamPages, prev + 1),
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black font-heading">
              About Page Stats
            </CardTitle>
            <CardDescription>
              Quick overview of what visitors see on the About page.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    Featured Team Members
                  </p>
                  <p className="text-lg font-black">{team.length}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    Gallery Images
                  </p>
                  <p className="text-lg font-black">{gallery.length}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Members with Contact Details
                </p>
                <p className="text-lg font-black">{totalContacts}</p>
              </div>
              <Badge>
                PUBLIC FACING
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-black font-heading">
              Farm & Market Gallery
            </CardTitle>
            <CardDescription>
              Images displayed in the About page gallery section.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openNewImage}
          >
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-4">
          {gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-bold text-sm">
                No gallery images configured yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Add a few hero images so visitors can swipe through your farm
                story.
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {paginatedGallery.map((image) => (
                <div
                  key={image.id}
                  className="min-w-[180px] max-w-[220px] rounded-xl border border-border overflow-hidden bg-card flex flex-col"
                >
                  <div className="h-28 w-full overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.caption ?? "Gallery image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 space-y-2 flex-1 flex flex-col">
                    <p className="text-[11px] text-muted-foreground line-clamp-3">
                      {image.caption || "No caption provided."}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 break-all">
                      {image.url}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2 mt-auto">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => openEditImage(image)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-foreground">
            <p>
              Page {galleryPage} of {totalGalleryPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[11px]"
                disabled={galleryPage <= 1}
                onClick={() =>
                  setGalleryPage((prev) => Math.max(1, prev - 1))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[11px]"
                disabled={galleryPage >= totalGalleryPages}
                onClick={() =>
                  setGalleryPage((prev) =>
                    Math.min(totalGalleryPages, prev + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
            <DialogDescription>
              These details power the &quot;People Behind The Produce&quot;
              section on the About page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={memberForm.name}
                onChange={(e) =>
                  setMemberForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role / Position</Label>
              <Input
                value={memberForm.role}
                onChange={(e) =>
                  setMemberForm((prev) => ({ ...prev, role: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Profile Image URL</Label>
              <Input
                value={memberForm.image}
                onChange={(e) =>
                  setMemberForm((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                You can paste a hosted image URL or upload a file below.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleMemberImageUpload}
                  className="h-9 text-xs"
                />
              </div>
              {memberForm.image && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-border">
                    <img
                      src={memberForm.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Preview of the image that will appear on the About page.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Short Bio</Label>
              <Textarea
                rows={3}
                value={memberForm.bio}
                onChange={(e) =>
                  setMemberForm((prev) => ({ ...prev, bio: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email (optional)</Label>
              <Input
                value={memberForm.email}
                onChange={(e) =>
                  setMemberForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input
                value={memberForm.phone}
                onChange={(e) =>
                  setMemberForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTeamDialogOpen(false);
                setEditingMember(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMember}>
              {editingMember ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={galleryDialogOpen} onOpenChange={setGalleryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingImage ? "Edit Gallery Image" : "Add Gallery Image"}
            </DialogTitle>
            <DialogDescription>
              These images appear in the swipeable About page gallery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={galleryForm.url}
                onChange={(e) =>
                  setGalleryForm((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://example.com/gallery.jpg"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Paste a hosted image URL or upload an image from your device.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageUpload}
                  className="h-9 text-xs"
                />
              </div>
              {galleryForm.url && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img
                      src={galleryForm.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    This preview matches what visitors see in the About gallery.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Caption (optional)</Label>
              <Textarea
                rows={3}
                value={galleryForm.caption}
                onChange={(e) =>
                  setGalleryForm((prev) => ({
                    ...prev,
                    caption: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGalleryDialogOpen(false);
                setEditingImage(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveImage}>
              {editingImage ? "Save Changes" : "Add Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

