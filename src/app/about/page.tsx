"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import {
  Users,
  Leaf,
  MapPin,
  Target,
  ShieldCheck,
  Heart,
  Calendar,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getAboutTeamMembers } from "@/lib/about-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchPublicGallery,
  galleryImageDisplayUrl,
} from "@/lib/api/gallery";
import { toSiteRelativeMediaSrc } from "@/lib/media-url";

type GalleryTile = { id: string; url: string; caption?: string };

const AboutPage = () => {
  const teamMembers = getAboutTeamMembers();
  const { t } = useLanguage();
  const galleryQuery = useQuery({
    queryKey: ["public-gallery", "about"],
    queryFn: () => fetchPublicGallery({ limit: 48 }),
  });

  const galleryImages: GalleryTile[] = useMemo(() => {
    const imgs = galleryQuery.data?.images ?? [];
    return [...imgs]
      .filter((g) => g.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((g) => ({
        id: g.id,
        url: galleryImageDisplayUrl(g),
        caption:
          g.caption?.en || g.caption?.rw || g.caption?.fr || undefined,
      }));
  }, [galleryQuery.data?.images]);

  const [selectedImage, setSelectedImage] = useState<GalleryTile | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const handleOpenImage = (image: GalleryTile) => {
    setSelectedImage(image);
    setGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[320px] sm:h-[400px] md:h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero.png"
            alt="About Agri-Eco"
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 font-heading drop-shadow-xl leading-tight">
            {t(translations.aboutPage.heroTitle1)} <br />
            <span className="text-primary-foreground">
              {t(translations.aboutPage.heroTitle2)}
            </span>
          </h1>
          <div className="flex items-center justify-center text-white/90 gap-2 text-sm md:text-base font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              {t(translations.aboutPage.breadHome)}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{t(translations.aboutPage.breadAbout)}</span>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-12 md:py-20 bg-card">
        <div className="w-full max-w-screen-2xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 w-full space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wider">
                <Leaf className="h-4 w-4" />
                {t(translations.aboutPage.ourStory)}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-[1.1] font-heading">
                {t(translations.aboutPage.storyTitle)}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t(translations.aboutPage.storyDesc)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">{t(translations.aboutPage.established)}</h4>
                    <p className="text-sm text-muted-foreground">{t(translations.aboutPage.establishedDesc)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">{t(translations.aboutPage.ourMission)}</h4>
                    <p className="text-sm text-muted-foreground">{t(translations.aboutPage.missionDesc)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image — constrained height on mobile so it doesn't dominate */}
            <div className="flex-1 w-full relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl sm:rotate-2 hover:rotate-0 transition-transform duration-500 max-h-[380px] lg:max-h-none">
                <Image
                  src="https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop"
                  alt="Farm scene"
                  width={800}
                  height={1000}
                  unoptimized
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="w-full aspect-[4/3] lg:aspect-[4/5] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-4 sm:-bottom-10 sm:-left-10 z-20 bg-primary text-white p-5 sm:p-8 rounded-xl hidden sm:block">
                <div className="text-3xl sm:text-4xl font-black mb-1">12+</div>
                <div className="text-xs sm:text-sm font-bold opacity-80 uppercase tracking-widest">
                  {t(translations.aboutPage.yearsOfTrust)}
                </div>
              </div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10 hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="w-full max-w-screen-2xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 md:mb-6 font-heading">
              {t(translations.aboutPage.coreValues)}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {t(translations.aboutPage.coreValuesSub)}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: ShieldCheck,
                title: t(translations.aboutPage.val1Title),
                desc: t(translations.aboutPage.val1Desc),
              },
              {
                icon: Users,
                title: t(translations.aboutPage.val2Title),
                desc: t(translations.aboutPage.val2Desc),
              },
              {
                icon: Heart,
                title: t(translations.aboutPage.val3Title),
                desc: t(translations.aboutPage.val3Desc),
              },
            ].map((value, i) => (
              <div
                key={i}
                className="bg-card p-8 md:p-10 rounded-3xl border border-border hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <value.icon className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-foreground mb-3 md:mb-4 font-heading">
                  {value.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-card">
        <div className="w-full max-w-screen-2xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 md:mb-16 border-b border-border pb-6 md:pb-8 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 md:mb-4 font-heading">
                {t(translations.aboutPage.teamTitle)}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {t(translations.aboutPage.teamSub)}
              </p>
            </div>
            <div className="flex gap-3">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Scrollable on mobile, grid on desktop */}
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible sm:mx-0 sm:px-0 lg:grid-cols-4 lg:gap-8">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="group flex flex-col items-center text-center min-w-[240px] snap-start sm:min-w-0"
              >
                <div className="relative w-full aspect-square mb-4 md:mb-6 rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={toSiteRelativeMediaSrc(member.image)}
                    alt={member.name}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 60vw"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-white text-xs leading-relaxed italic">
                    &quot;{member.bio}&quot;
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-black text-foreground mb-1 font-heading">
                  {member.name}
                </h3>
                <p className="text-xs md:text-sm font-bold text-primary uppercase tracking-widest">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Map Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="w-full max-w-screen-2xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground font-heading">
                {t(translations.aboutPage.visitFarm)}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t(translations.aboutPage.visitDesc)}
              </p>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-foreground">{t(translations.aboutPage.mainHQ)}</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      KN 123 St, Musanze District, Northern Province, Rwanda
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-foreground">{t(translations.aboutPage.publicTours)}</h4>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {t(translations.aboutPage.toursSchedule)}
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild>
                <Link href="/contact">{t(translations.aboutPage.getDirections)}</Link>
              </Button>
            </div>

            {/* Map — fixed height on all screens */}
            <div className="h-[300px] sm:h-[400px] lg:h-[450px] bg-card rounded-[32px] overflow-hidden border-8 border-card shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31913.43572886738!2d29.61053075!3d-1.4988451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc183617349911%3A0xe549557b44760826!2sMusanze!5e0!3m2!1sen!2srw!4v1709560000000!5m2!1sen!2srw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Agri-Eco Farm Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 md:py-20 bg-card overflow-hidden">
        <div className="w-full max-w-screen-2xl mx-auto px-4 mb-8 md:mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 md:mb-4 font-heading">
              {t(translations.aboutPage.ourGallery)}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {t(translations.aboutPage.galleryDesc)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 px-2 md:px-4 w-full max-w-screen-2xl mx-auto">
          {galleryQuery.isLoading ? (
            <p className="text-sm text-muted-foreground py-8 px-4 col-span-full text-center">
              {t(translations.aboutPage.loadingGallery)}
            </p>
          ) : galleryImages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 px-4 col-span-full text-center">
              {t(translations.aboutPage.noGallery)}
            </p>
          ) : (
            galleryImages.map((img) => (
              <button
                key={img.id}
                type="button"
                className="relative aspect-square group overflow-hidden cursor-zoom-in rounded-xl border border-border/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => handleOpenImage(img)}
              >
                <Image
                  src={img.url}
                  alt={img.caption || "Gallery image"}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </button>
            ))
          )}
        </div>

        <div className="w-full max-w-screen-2xl mx-auto px-4 mt-8 md:mt-10 flex justify-center">
          <Button asChild size="lg" className="font-bold">
            <Link href="/gallery">{t(translations.aboutPage.discoverGallery)}</Link>
          </Button>
        </div>
      </section>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-xs sm:max-w-xl md:max-w-3xl w-[calc(100vw-2rem)]">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>{t(translations.aboutPage.galleryTitle)}</DialogTitle>
                <DialogDescription>
                  {selectedImage.caption || t(translations.aboutPage.galleryCaption)}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                <div className="w-full overflow-hidden rounded-2xl border border-border bg-black/5">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.caption || "Gallery image"}
                    width={1200}
                    height={800}
                    unoptimized
                    sizes="(min-width: 768px) 60vw, 95vw"
                    className="w-full max-h-[60vh] object-contain bg-black/5"
                  />
                </div>
                {selectedImage.caption && (
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.caption}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AboutPage;