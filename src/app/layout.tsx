import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { buildSiteMetadata } from "@/lib/seo";
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

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return buildSiteMetadata(settings);
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
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <SessionProvider>
          <Navbar siteTitle={settings.siteTitle} />
          <div className="flex-1">{children}</div>
          <Footer
            siteTitle={settings.siteTitle}
            footerTagline={settings.footerTagline}
            instagram={settings.instagram}
            vimeo={settings.vimeo}
            youtube={settings.youtube}
          />
        </SessionProvider>
      </body>
    </html>
  );
}