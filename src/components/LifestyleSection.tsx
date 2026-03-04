import { Apple, Leaf, Heart, Snowflake, Sun } from "lucide-react";

const lifestyles = [
  { name: "Plant Based", icon: Leaf, color: "bg-primary/10 text-primary" },
  { name: "Keto Diet", icon: Heart, color: "bg-badge-sale/10 text-badge-sale" },
  { name: "Vegan", icon: Apple, color: "bg-primary/10 text-primary" },
  {
    name: "Active Diet",
    icon: Sun,
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    name: "Raw Food",
    icon: Snowflake,
    color: "bg-accent text-accent-foreground",
  },
];

const LifestyleSection = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container">
        <h2 className="section-heading">Shop by Lifestyle</h2>
        <p className="section-subheading">
          Find products that fit your dietary preferences
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {lifestyles.map((item) => (
            <a
              key={item.name}
              href="#"
              className="group flex flex-col items-center gap-3 hover:scale-105 transition-transform"
            >
              <div
                className={`w-20 h-20 rounded-2xl ${item.color} flex items-center justify-center group-hover:shadow-md transition-shadow`}
              >
                <item.icon className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
