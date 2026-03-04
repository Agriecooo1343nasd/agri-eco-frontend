import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const heroBanner = "/assets/hero-banner.jpg";

  return (
    <section className="relative overflow-hidden">
      {/* Main hero */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[550px]">
        <img
          src={heroBanner}
          alt="Fresh organic vegetables and fruits"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-lg animate-fade-in-up">
            <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              🌱 Farm Fresh
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-card font-heading leading-tight">
              Organic &<br />
              Healthy Food
            </h2>
            <p className="mt-4 text-card/80 text-sm md:text-base max-w-md">
              Delivering 100% organic, locally sourced fruits, vegetables, and
              natural products straight from the farm to your table.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all hover:gap-3"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#categories"
                className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm text-card border border-card/30 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-card/30 transition-colors"
              >
                Explore Categories
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-banners */}
      <div className="container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-banner-green rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl">🥬</div>
            <div>
              <h3 className="font-heading font-bold text-foreground text-sm flex-1">
                Healthy Vegetables
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Farm-fresh organic veggies
              </p>
              <a
                href="#"
                className="text-[10px] font-bold text-primary mt-2 inline-block hover:underline"
              >
                Shop Now →
              </a>
            </div>
          </div>
          <div className="bg-banner-cream rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl">🍊</div>
            <div>
              <h3 className="font-heading font-bold text-foreground text-sm">
                Fresh Fruits
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Sweet & juicy organic fruits
              </p>
              <a
                href="#"
                className="text-[10px] font-bold text-primary mt-2 inline-block hover:underline"
              >
                Shop Now →
              </a>
            </div>
          </div>
          <div className="bg-banner-green rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1">
            <div className="text-3xl">🧃</div>
            <div>
              <h3 className="font-heading font-bold text-foreground text-sm">
                Organic Juices
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Cold-pressed natural juice
              </p>
              <a
                href="#"
                className="text-[10px] font-bold text-primary mt-2 inline-block hover:underline"
              >
                Shop Now →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
