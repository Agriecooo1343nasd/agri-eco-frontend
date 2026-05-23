import { LegalPageView } from "@/components/LegalPageView";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | Agri-Eco",
  description: "Read our terms of service to understand the rules and guidelines for using the Agri-Eco platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-white">
        <LegalPageView type="terms_of_service" />
      </main>
      <Footer />
    </div>
  );
}
