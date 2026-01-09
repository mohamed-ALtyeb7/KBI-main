import type React from "react"
import type { Metadata } from "next"
import type { Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { LanguageProvider } from "@/components/providers/language-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "KBI | On-Site Repair Services Abu Dhabi",
  description:
    "Fast, professional on-site repair for phones, laptops, printers, monitors, TVs, Apple Watch, CCTV, and gaming consoles in Abu Dhabi.",
  generator: 'v0.app',
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KBI Repairs'
  }
}

export const viewport: Viewport = {
  themeColor: '#06b6d4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/apple-icon.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body suppressHydrationWarning className={cn("min-h-screen font-sans antialiased selection:bg-cyan-500/20", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('${basePath}/sw.js')
                    .then(function(registration) {
                      void 0;
                    })
                    .catch(function(error) {
                      void 0;
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}
