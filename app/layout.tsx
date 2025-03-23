import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Plan your next adventure",
  icons: {
    icon: [
      {
        url: "/icons/icon.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icons/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/icon.png",
        sizes: "48x48",
        type: "image/x-icon",
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
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Travel Planner",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
