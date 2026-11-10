import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.anjanarodrigo.com"),
  title: "Anjana Rodrigo | Founder of MineBook | CTO @ Starloge | Mining Engineer",
  description:
    "Explore the work of Anjana Rodrigo as an interactive 3D world: MineBook, software engineering projects, the Crack Survey application, professional experience and published IEEE research.",
  openGraph: {
    title: "Anjana Rodrigo | Engineering Ideas Into Digital Reality",
    description: "An interactive 3D portfolio: MineBook, software engineering, construction surveys, experience and research.",
    type: "website",
  },
}

export const viewport: Viewport = { themeColor: "#102C25", width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  )
}
