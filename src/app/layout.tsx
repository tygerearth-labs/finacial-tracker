import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { AppWrapper } from "@/components/app-wrapper";
import { ProfileProvider } from "@/contexts/ProfileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial Tracker - Aplikasi Pencatatan Keuangan",
  description: "Aplikasi pencatatan keuangan modern dengan multi profil, dashboard interaktif, dan manajemen target tabungan",
  keywords: ["Financial Tracker", "Keuangan", "Aplikasi Keuangan", "Budget", "Tabungan", "Next.js", "TypeScript"],
  authors: [{ name: "Financial Tracker Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Financial Tracker",
    description: "Aplikasi pencatatan keuangan modern dengan multi profil",
    url: "https://financial-tracker.com",
    siteName: "Financial Tracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Tracker",
    description: "Aplikasi pencatatan keuangan modern",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <div className="flex flex-col min-h-screen">
          <ProfileProvider>
            <Navbar />
            <AppWrapper>
              {children}
            </AppWrapper>
          </ProfileProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
