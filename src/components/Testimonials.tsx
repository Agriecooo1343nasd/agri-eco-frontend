import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Regular Customer",
    text: "Agri-Eco has completely changed how my family eats. The produce is incredibly fresh, and I love knowing it's all organic. The delivery is always on time!",
    rating: 5,
  },
  {
    name: "James K.",
    role: "Health Enthusiast",
    text: "The quality of fruits and vegetables from Agri-Eco is unmatched. I've been a loyal customer for over a year and the consistency is remarkable. Highly recommended!",
    rating: 5,
  },
  {
    name: "Maria L.",
    role: "Home Chef",
    text: "As a chef, I'm very particular about my ingredients. Agri-Eco delivers premium organic products that make my dishes taste extraordinary. Best organic store!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <h2 className="section-heading">What Our Customers Say</h2>
        <p className="section-subheading">
          Trusted by thousands of happy customers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
                    className="h-3.5 w-3.5 fill-badge-organic text-badge-organic"
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
