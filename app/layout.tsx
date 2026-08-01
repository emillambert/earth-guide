import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const guideMono = IBM_Plex_Mono({
  variable: "--font-guide-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Hitchhiker’s Guide to the Galaxy",
  description:
    "The Hitchhiker’s Guide to the Galaxy — practical Earth edition. Look anything up. Don’t panic.",
  applicationName: "The Hitchhiker’s Guide to the Galaxy",
  manifest: "/hitchhikers-guide.webmanifest",
  appleWebApp: {
    capable: true,
    // Keep status bar readable; content still uses safe-area insets below.
    statusBarStyle: "black-translucent",
    title: "Hitchhiker’s Guide",
  },
  icons: {
    icon: [
      {
        url: "/icons/hitchhikers-icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/hitchhikers-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/hitchhikers-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/hitchhikers-apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#20211f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${guideMono.variable} h-full`}>
      <body className="min-h-full font-mono antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
