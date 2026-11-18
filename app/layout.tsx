import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HideOnAdmin from "@/components/HideOnAdmin";
import { DEFAULT_OG_IMAGE, siteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Valores por defecto de todo el sitio; cada página define los suyos con `pageMetadata` (lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Universal Tours | Asesoría, cotización y venta de viajes",
    template: "%s | Universal Tours",
  },
  description:
    "Asesoría personalizada, cotización y venta de viajes: destinos, paquetes, experiencias y eventos, en Bolivia y el mundo.",
  applicationName: "Universal Tours",
  openGraph: { siteName: "Universal Tours", locale: "es_BO", type: "website", images: [DEFAULT_OG_IMAGE] },
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HideOnAdmin>
          <Header />
        </HideOnAdmin>
        {children}
        <HideOnAdmin>
          <Footer />
        </HideOnAdmin>
      </body>
    </html>
  );
}
