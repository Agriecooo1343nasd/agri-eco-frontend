"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Tourist from USA",
    text: "The beekeeping tour was absolutely incredible! Getting suited up and inspecting live hives was an experience I'll never forget. The honey tasting afterwards was divine.",
    rating: 5,
  },
  {
    name: "Jean Baptiste Mugisha",
    role: "Regular Customer, Kigali",
    text: "Agri-Eco has completely changed how my family eats. The produce is incredibly fresh, and I love knowing it's all certified organic. Delivery is always on time!",
    rating: 5,
  },
  {
    name: "Teacher Marie Claire",
    role: "Green Hills Academy",
    text: "Our students learned more in one farm visit than a month of classroom lessons. The curriculum-aligned activities and hands-on experiments were perfectly organized.",
    rating: 5,
  },
  {
    name: "Patrick Habimana",
    role: "Rwanda Explorer Tours",
    text: "As a tourism partner, the collaboration has been seamless. Our gorilla trek + farm tour package is now our most popular offering. The commission tracking is transparent.",
    rating: 5,
  },
  {
    name: "Aline Uwase",
    role: "Farmer Trainee",
    text: "The organic farming course gave me the knowledge and confidence to convert my small farm. My yields have improved and I now sell certified organic produce at premium prices.",
    rating: 5,
  },
  {
    name: "David Karenzi",
    role: "Home Chef, Musanze",
    text: "The Harvest & Cook experience was magical. Picking vegetables and cooking a traditional meal with Chef Mutesi — I've never tasted food that fresh. Truly farm-to-table.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <h2 className="section-heading">What People Are Saying</h2>
        <p className="section-subheading">
          Trusted by visitors, farmers, partners, and educators
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <Quote className="h-8 w-8 text-primary/30 mb-3" />
              <p className="text-foreground text-sm leading-relaxed">
                {t.text}
              </p>
              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-3.5 w-3.5 fill-secondary text-secondary"
                  />
                ))}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <p className="font-semibold text-foreground text-sm">
                  {t.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
