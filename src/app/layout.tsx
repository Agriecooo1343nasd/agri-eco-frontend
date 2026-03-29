import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Agri-Eco | Fresh Organic Products",
  description:
    "Your trusted source for 100% organic, farm-fresh agricultural products.",
   icons: {
    icon: [
      { url: "/assets/logo/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo/logo.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/logo/logo.png", sizes: "96x96", type: "image/png" },
      { url: "/assets/logo/logo.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased font-body transition-colors duration-300"
        style={
          {
            "--font-merriweather":
              '"Merriweather", Georgia, "Times New Roman", serif',
            "--font-nunito-sans":
              '"Nunito Sans", Inter, Arial, "Helvetica Neue", sans-serif',
          } as Record<string, string>
        }
        suppressHydrationWarning
      >
        <NextTopLoader
          color="#22c55e"
          initialPosition={0.08}
          crawlSpeed={200}
          height={6}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #22c55e,0 0 5px #22c55e"
        />
        <AppProviders>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </AppProviders>
      </body>
    </html>
  );
}
