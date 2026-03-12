"use client";

import { useState } from "react";
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
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  getAboutGalleryImages,
  getAboutTeamMembers,
} from "@/lib/about-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AboutGalleryImage } from "@/data/site";

const AboutPage = () => {
  const teamMembers = getAboutTeamMembers();
  const rawGallery = getAboutGalleryImages();
  const galleryImages: AboutGalleryImage[] = rawGallery.map((img, index) =>
    typeof img === "string"
      ? { id: `about-gallery-${index}`, url: img }
      : img,
  );

  const [selectedImage, setSelectedImage] = useState<AboutGalleryImage | null>(
    null,
  );
  const [galleryOpen, setGalleryOpen] = useState(false);

  const handleOpenImage = (image: AboutGalleryImage) => {
    setSelectedImage(image);
    setGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero.png"
            alt="About Agri-Eco"
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="container relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-heading drop-shadow-xl">
            Rooted in Nature. <br />
            <span className="text-primary-foreground">
              Driven by Freshness.
            </span>
          </h1>
          <div className="flex items-center justify-center text-white/90 gap-2 text-sm md:text-base font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">About Us</span>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 bg-card">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-wider">
                <Leaf className="h-4 w-4" />
                Our Story
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] font-heading">
                Growing Since 2012 <br /> From a Small Family Farm.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Agri-Eco started with a simple belief: that healthy, organic
                food should be accessible to everyone, not just a luxury. What
                began as a 5-acre family farm in the heart of the countryside
                has blossomed into Rwanda's leading network of organic
                producers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">
                      Established 2012
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Started with just 3 passionate farmers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">Our Mission</h4>
                    <p className="text-sm text-muted-foreground">
                      100% Organic, zero harmful pesticides.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop"
                  alt="Farm scene"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 z-20 bg-primary text-white p-8 rounded-xl hidden md:block animate-bounce-subtle">
                <div className="text-4xl font-black mb-1">12+</div>
                <div className="text-sm font-bold opacity-80 uppercase tracking-widest">
                  Years of Trust
                </div>
              </div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 font-heading">
              Our Core Values
            </h2>
            <p className="text-muted-foreground">
              The principles that guide every seed we plant and every box we
              deliver.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Organic",
                desc: "We follow strict organic standards, ensuring no chemical pesticides or fertilizers ever touch our soil.",
              },
              {
                icon: Users,
                title: "Fair For Farmers",
                desc: "By cutting out middle-men, we ensure our farmers get paid fairly for their hard work and dedication.",
              },
              {
                icon: Heart,
                title: "Health First",
                desc: "Your health is our priority. Fresh produce is harvested and delivered within 24 hours for maximum nutrients.",
              },
            ].map((value, i) => (
              <div
                key={i}
                className="bg-card p-10 rounded-3xl border border-border hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4 font-heading">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-card">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-16 border-b border-border pb-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 font-heading">
                The People Behind The Produce
              </h2>
              <p className="text-muted-foreground">
                Expert cultivators, logistics masters, and quality enthusiasts.
              </p>
            </div>
            <div className="hidden lg:flex gap-2">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:mx-0 lg:px-0">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="group flex flex-col items-center text-center min-w-[260px] snap-start lg:min-w-0"
              >
                <div className="relative w-full aspect-square mb-6 rounded-3xl overflow-hidden shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 text-white text-xs leading-relaxed italic">
                    "{member.bio}"
                  </div>
                </div>
                <h3 className="text-xl font-black text-foreground mb-1 font-heading">
                  {member.name}
                </h3>
                <p className="text-sm font-bold text-primary uppercase tracking-widest">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Map Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-foreground font-heading">
                Visit Our Farm
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in transparency. Our main headquarters and processing
                facility are located right at our flagship farm in Musanze. Come
                visit us during our weekend farm tours!
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-black text-foreground">
                      Main HQ & Farm
                    </h4>
                    <p className="text-muted-foreground">
                      KN 123 St, Musanze District, Northern Province, Rwanda
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-black text-foreground">
                      Public Farm Tours
                    </h4>
                    <p className="text-muted-foreground">
                      Every Saturday & Sunday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
              <Button
                asChild
              >
                <Link href="/contact">Get Directions</Link>
              </Button>
            </div>
            <div className="h-[450px] bg-card rounded-[40px] overflow-hidden border-8 border-card shadow-2xl relative">
              {/* Simulated Map */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31913.43572886738!2d29.61053075!3d-1.4988451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc183617349911%3A0xe549557b44760826!2sMusanze!5e0!3m2!1sen!2srw!4v1709560000000!5m2!1sen!2srw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Agri-Eco Farm Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-card overflow-hidden">
        <div className="container px-4 mx-auto mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 font-heading">
              Our Gallery
            </h2>
            <p className="text-muted-foreground">
              A glimpse into our daily life at the farm.
            </p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-2 pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-6 md:gap-2 md:overflow-visible">
          {galleryImages.map((img) => (
            <button
              key={img.id}
              type="button"
              className="aspect-square group overflow-hidden cursor-zoom-in min-w-[45%] md:min-w-0 snap-start focus:outline-none"
              onClick={() => handleOpenImage(img)}
            >
              <img
                src={img.url}
                alt={img.caption || "Gallery image"}
                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 brightness-90 group-hover:brightness-110"
              />
            </button>
          ))}
        </div>
      </section>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-3xl">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle>Gallery Image</DialogTitle>
                <DialogDescription>
                  {selectedImage.caption ||
                    "Captured moments from our farm and community."}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                <div className="w-full overflow-hidden rounded-2xl border border-border bg-black/5">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.caption || "Gallery image"}
                    className="w-full h-full max-h-[480px] object-contain bg-black/5"
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
