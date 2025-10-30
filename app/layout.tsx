import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { CommandPalette } from '@/components/features/command-palette'
import { Navigation } from '@/components/features/navigation'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  metadataBase: new URL('https://anjanarodrigo.com'),
  title: {
    default: 'Anjana Rodrigo - Innovator | Engineer | Educator | Developer',
    template: '%s | Anjana Rodrigo'
  },
  description: 'Transforming ideas into technology that replaces manual systems. Portfolio of Anjana Rodrigo, a Software Innovator specializing in Flutter, React, Node.js, and Cloud Technologies.',
  keywords: ['Anjana Rodrigo', 'Software Developer', 'Flutter', 'React', 'Node.js', 'Full Stack Developer', 'Portfolio', 'Engineer', 'Educator'],
  authors: [{ name: 'Anjana Rodrigo' }],
  creator: 'Anjana Rodrigo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://anjanarodrigo.com',
    title: 'Anjana Rodrigo - Innovator | Engineer | Educator | Developer',
    description: 'Transforming ideas into technology that replaces manual systems',
    siteName: 'Anjana Rodrigo Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Anjana Rodrigo Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anjana Rodrigo - Innovator | Engineer | Educator | Developer',
    description: 'Transforming ideas into technology that replaces manual systems',
    images: ['/og-image.png'],
    creator: '@anjanarodrigo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased font-sans">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Navigation />
          <div className="relative flex min-h-screen flex-col">
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
          <CommandPalette />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
