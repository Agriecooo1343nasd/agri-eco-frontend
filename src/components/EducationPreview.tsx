"use client";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Award,
} from "lucide-react";
import Link from "next/link";
import { trainingPrograms } from "@/data/education";
import { usePricing } from "@/context/PricingContext";

const EducationPreview = () => {
  const { formatPrice } = usePricing();
  const openPrograms = trainingPrograms
    .filter((p) => p.status === "open")
    .slice(0, 3);

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            <BookOpen className="h-3.5 w-3.5" /> Educational Hub
          </span>
          <h2 className="section-heading">Learn & Grow With Us</h2>
          <p className="section-subheading">
            From school visits to farmer training — empowering communities
            through agricultural education
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: GraduationCap, label: "Training Programs", value: "12+" },
            { icon: Users, label: "Farmers Trained", value: "500+" },
            { icon: BookOpen, label: "School Visits", value: "85+" },
            { icon: Award, label: "Certificates Issued", value: "340+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {openPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={program.image}
                  alt={program.title.en}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {program.type}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {program.level.en}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-foreground text-sm">
                  {program.title.en}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {program.description.en}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(program.price)}
                  </span>
                  <div className="text-right">
                    <div className="w-24 bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(program.enrolled / program.maxParticipants) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {program.enrolled}/{program.maxParticipants} enrolled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/education"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all hover:gap-3"
          >
            Explore All Programs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EducationPreview;
