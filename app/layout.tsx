import { RealtimeListener } from "@/app/components/RealtimeListener";
import { SiteChrome } from "@/app/components/SiteChrome";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Analyst Portfolio",
  description: "Portfolio data analysis, big data and full stack development.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050816] text-slate-100">
        <RealtimeListener />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

