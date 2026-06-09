import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ScrollToTop } from "@/components/scroll-to-top"
import { FloatingButtons } from "@/components/floating-buttons"
import { ClientProviders } from "@/components/client-providers"
import { Navigation } from "@/components/navigation"
import { ConfigWarning } from "@/components/config-warning"
import { CursorTrail } from "@/components/cursor-trail"
import { PageLoader } from "@/components/page-loader"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://m2studio.in"),
  title: {
    default: "M2 Studio - Professional Video Editing & Creative Studio",
    template: "%s | M2 Studio",
  },
  description:
    "Premium video editing services including wedding films, reels, YouTube editing, thumbnails, logos, and more. Professional creative studio for content creators and businesses.",
  keywords: [
    "video editing",
    "wedding films",
    "reels editing",
    "YouTube editing",
    "thumbnail design",
    "logo design",
    "creative studio",
    "M2 Studio",
    "video production",
    "content creation",
    "professional editing",
    "cinematic videos",
  ],
  authors: [{ name: "M2 Studio" }],
  creator: "M2 Studio",
  publisher: "M2 Studio",
  generator: "v0.app",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://m2studio.in",
    siteName: "M2 Studio",
    title: "M2 Studio - Professional Video Editing & Creative Studio",
    description:
      "Premium video editing services for content creators and businesses. Wedding films, YouTube editing, reels, thumbnails, and more.",
    images: [
      {
        url: "https://m2studio.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "M2 Studio - Professional Video Editing",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "M2 Studio - Professional Video Editing & Creative Studio",
    description: "Premium video editing services for content creators and businesses.",
    images: ["/og-image.jpg"],
    creator: "@m2studio",
  },
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: "#FACC15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" style={{ scrollPaddingTop: "64px" }}>
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "M2 Studio",
              description: "Professional video editing and creative studio",
              url: "https://m2studio.in",
              logo: "https://m2studio.in/logo.jpg",
              sameAs: ["https://instagram.com/m2studio", "https://youtube.com/@m2studio"],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-XXXXXXXXXX",
                contactType: "customer service",
              },
              service: [
                {
                  "@type": "Service",
                  name: "Video Editing",
                  description: "Professional video editing for YouTube, weddings, and more",
                },
                {
                  "@type": "Service",
                  name: "Thumbnail Design",
                  description: "Eye-catching thumbnails for YouTube videos",
                },
                {
                  "@type": "Service",
                  name: "Logo Design",
                  description: "Professional logo design for brands",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ClientProviders>
          <PageLoader />
          <CursorTrail />
          <Navigation />
          {/* Show a visible warning when Firebase client config is missing */}
          <ConfigWarning />
          <ScrollToTop />
          <FloatingButtons />
          <main className="page-transition">{children}</main>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
