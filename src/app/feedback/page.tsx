"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MessageCircle, Send, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const feedbackTypes = [
  "General",
  "Bug Report",
  "Feature Request",
  "Compliment",
  "Complaint",
];

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "General",
    rating: 0,
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // In production, this would save to backend
    setSubmitted(true);
    toast.success("Thank you! Your feedback has been submitted.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-2">
              Thank You!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully. We appreciate your
              input and will review it shortly.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  type: "General",
                  rating: 0,
                  message: "",
                });
              }}
              variant="outline"
            >
              Submit Another
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="bg-primary/5 border-b border-border">
        <div className="container py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <MessageCircle className="h-4 w-4" />
            Share Your Feedback
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            We Value Your Opinion
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Help us improve by sharing your experience. Your feedback helps
            shape a better platform for everyone.
          </p>
        </div>
      </section>

      <div className="container py-8 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Phone (optional)
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Feedback Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackTypes.map((ft) => (
                        <SelectItem key={ft} value={ft}>
                          {ft}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Star rating */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  How would you rate your experience?
                </Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7",
                          star <= form.rating
                            ? "fill-secondary text-secondary"
                            : "text-border",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Your Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Tell us what you think about the platform..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
