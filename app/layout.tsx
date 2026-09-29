import type { Metadata } from "next";
import "@fontsource-variable/schibsted-grotesk";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RequestModal from "@/components/RequestModal";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  metadataBase: new URL("https://mulveyswoodworking.com"),
  title: {
    default: "Mulvey's Woodworking | Heirloom toys for modern times",
    template: "%s | Mulvey's Woodworking",
  },
  description:
    "Wooden toys, puzzles, engraved gifts, flags and kids' furniture, made to order in a basement workshop in Northern NJ.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <RequestModal />
        </CartProvider>
      </body>
    </html>
  );
}
