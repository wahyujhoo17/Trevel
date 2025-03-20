import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Southeast Asia Trip Planner - Plan Your Perfect Adventure",
  description:
    "Plan your perfect Southeast Asian adventure with AI-powered itineraries, local insights, and comprehensive travel guides.",
  icons: {
    icon: [
      {
        url: "/icons/favicon.ico",
        sizes: "32x32",
      },
      {
        url: "/icons/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
