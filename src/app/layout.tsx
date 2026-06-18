import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle}`,
    },
    description:
      settings.bio ??
      "Personal photography and cinematic video portfolio.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar siteTitle={settings.siteTitle} />
        <div className="flex-1">{children}</div>
        <Footer
          siteTitle={settings.siteTitle}
          bio={settings.bio}
          instagram={settings.instagram}
          vimeo={settings.vimeo}
          youtube={settings.youtube}
        />
      </body>
    </html>
  );
}