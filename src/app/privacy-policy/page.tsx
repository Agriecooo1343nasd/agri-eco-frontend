import { LegalPageView } from "@/components/LegalPageView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Agri-Eco",
  description: "Learn about how we collect, use, and protect your personal information at Agri-Eco.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-white">
        <LegalPageView type="privacy_policy" />
      </main>
      <Footer />
    </div>
  );
}
