import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoX — Custom Cars. Live the Life.",
  description:
    "Configure your dream car. Scroll through an immersive 3D reveal, then build your perfect specification with our real-time customizer.",
  keywords: ["luxury cars", "car configurator", "custom cars", "automotive"],
  openGraph: {
    title: "AutoX — Custom Cars. Live the Life.",
    description: "Build your perfect car. Powered by AutoX.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
