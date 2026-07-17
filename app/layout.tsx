import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "K-NETWORK | Wellness Today. Wealth Tomorrow.",
    template: "%s | K-NETWORK",
  },
  description:
    "Nigeria's modern wellness and referral platform. Earn rewards, build your network, and grow your wealth with K-NETWORK.",
  keywords: [
    "wellness",
    "health",
    "referral",
    "network marketing",
    "earn rewards",
    "K-NETWORK",
    "Nigeria",
    "wellness platform",
    "referral bonuses",
  ],
  authors: [{ name: "K-NETWORK" }],
  creator: "K-NETWORK",
  publisher: "K-NETWORK",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://k-network.com",
    siteName: "K-NETWORK",
    title: "K-NETWORK | Wellness Today. Wealth Tomorrow.",
    description:
      "Nigeria's modern wellness and referral platform. Earn rewards, build your network, and grow your wealth.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "K-NETWORK - Wellness Today. Wealth Tomorrow.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "K-NETWORK | Wellness Today. Wealth Tomorrow.",
    description:
      "Nigeria's modern wellness and referral platform. Earn rewards, build your network, and grow your wealth.",
    images: ["/og-image.jpg"],
    creator: "@knetwork",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://k-network.com"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* Theme color */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        
        {/* Viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body className="bg-slate-950 text-white antialiased min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col min-h-screen">
          {children}
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}