import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import BestSellers from "@/components/BestSellers";
import PromoBanner from "@/components/PromoBanner";
import LifestyleSection from "@/components/LifestyleSection";
import Testimonials from "@/components/Testimonials";
import FeaturesBar from "@/components/FeaturesBar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <BestSellers />
        <PromoBanner />
        <LifestyleSection />
        <Testimonials />
        <FeaturesBar />
      </main>
      <Footer />
    </div>
  );
}
