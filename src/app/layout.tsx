import type { Metadata } from "next";
import { Merriweather, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Agri-Eco | Fresh Organic Products",
  description:
    "Your trusted source for 100% organic, farm-fresh agricultural products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${merriweather.variable} ${nunitoSans.variable} antialiased font-body transition-colors duration-300`}
        suppressHydrationWarning
      >
        <AppProviders>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </AppProviders>
      </body>
    </html>
  );
}
