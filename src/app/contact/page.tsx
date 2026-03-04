"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronRight,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Message Sent!", {
        description:
          "Thank you for reaching out. We will get back to you within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary/5 py-12 md:py-20">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 font-heading">
            Get In Touch
          </h1>
          <div className="flex items-center justify-center text-muted-foreground gap-2 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Contact Us</span>
          </div>
        </div>
      </section>

      <main className="flex-1 container px-4 mx-auto -mt-10 mb-20">
        <div className="bg-card rounded-[40px] shadow-md overflow-hidden border border-border">
          <div className="flex flex-col lg:flex-row">
            {/* Left Column: Contact Info */}
            <div className="lg:w-2/5 bg-primary p-8 md:p-12 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-heading">
                  Contact Information
                </h2>
                <p className="text-white/80 mb-12 text-lg">
                  Have questions about our organic certification or need help
                  with an order? Our team is here to help!
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-widest">
                        Call Us
                      </p>
                      <p className="text-xl font-bold">+250 (788) 123-456</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-widest">
                        Email Us
                      </p>
                      <p className="text-xl font-bold">hello@agri-eco.rw</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-widest">
                        Visit Us
                      </p>
                      <p className="text-xl font-bold">
                        KN 123 St, Musanze, Rwanda
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-widest">
                        Work Hours
                      </p>
                      <p className="text-xl font-bold">
                        Mon - Sat: 08:00 - 18:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16">
                <p className="text-sm font-medium text-white/60 mb-6 uppercase tracking-widest text-center lg:text-left">
                  Follow Our Socials
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="flex-1 p-8 md:p-16">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-foreground mb-4 font-heading">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground mb-10">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground uppercase tracking-wider">
                        Full Name
                      </label>
                      <Input
                        placeholder="e.g. Jean Doe"
                        required
                        className="h-14 rounded-xl border-border bg-muted/20 focus:bg-white transition-all text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground uppercase tracking-wider">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="e.g. jean@example.com"
                        required
                        className="h-14 rounded-xl border-border bg-muted/20 focus:bg-white transition-all text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground uppercase tracking-wider">
                      Subject
                    </label>
                    <Input
                      placeholder="How can we help?"
                      required
                      className="h-14 rounded-xl border-border bg-muted/20 focus:bg-white transition-all text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground uppercase tracking-wider">
                      Your Message
                    </label>
                    <Textarea
                      placeholder="Write your details here..."
                      required
                      className="min-h-[180px] rounded-2xl border-border bg-muted/20 focus:bg-white transition-all text-lg p-4 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex items-start gap-4">
            <Headphones className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h4 className="font-bold text-foreground mb-2 font-heading">
                Order Help
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Track your organic produce in real-time.
              </p>
              <button className="text-primary font-bold text-sm hover:underline">
                Track Order
              </button>
            </div>
          </div>
          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex items-start gap-4">
            <Mail className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h4 className="font-bold text-foreground mb-2 font-heading">
                Email Support
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                We usually respond within 2-4 business hours.
              </p>
              <button className="text-primary font-bold text-sm hover:underline">
                Send Email
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
