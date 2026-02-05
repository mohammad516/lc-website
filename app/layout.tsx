import type { Metadata } from "next";
import "./globals.css";

// import MetaPixel from "@/app/components/MetaPixel";
import { CartProvider } from "@/contexts/CartContext";
import LoadingScreen from "@/components/LoadingScreen";

import { Inter, Playfair_Display, Dancing_Script, Lora, Namdhinggo, Montserrat } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const namdhinggo = Namdhinggo({
  variable: "--font-namdhinggo",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "LC Organic Skin Care",
  description: "LC Organic Skin Care",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} ${dancingScript.variable} ${lora.variable} ${namdhinggo.variable} ${montserrat.variable} antialiased`}
      >
        {/* Meta Pixel must be inside body */}
        {/* <MetaPixel /> */}

        <LoadingScreen />

        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
