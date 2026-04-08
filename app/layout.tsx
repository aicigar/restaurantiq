import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "RestaurantIQ — AI-Powered Restaurant Intelligence",
  description: "Make smarter location, review, and competitive decisions for your restaurant — in seconds, not weeks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans bg-navy text-white antialiased">{children}</body>
    </html>
  );
}
