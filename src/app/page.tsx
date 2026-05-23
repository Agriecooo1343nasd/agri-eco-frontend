import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedTours from "@/components/FeaturedTours";
import BestSellers from "@/components/BestSellers";
import BeekeepingShowcase from "@/components/BeekeepingShowcase";
import PromoBanner from "@/components/PromoBanner";
import EducationPreview from "@/components/EducationPreview";
import ArtisanShowcase from "@/components/ArtisanShowcase";
import Testimonials from "@/components/Testimonials";
import FeaturesBar from "@/components/FeaturesBar";
import Footer from "@/components/Footer";
import { FeatureGuard } from "@/components/FeatureGuard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        <FeatureGuard feature="tours">
          <FeaturedTours />
          <BeekeepingShowcase />
        </FeatureGuard>
        
        <FeatureGuard feature="shopping">
          <BestSellers />
        </FeatureGuard>
        
        <PromoBanner />
        
        <FeatureGuard feature="training">
          <EducationPreview />
        </FeatureGuard>
        
        <ArtisanShowcase />
        <Testimonials />
        <FeaturesBar />
      </main>
      <Footer />
    </div>
  );
}
