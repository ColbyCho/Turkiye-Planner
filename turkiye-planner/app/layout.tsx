import type { Metadata, Viewport } from 'next'
import RegisterSW from '@/components/RegisterSW'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Türkiye Planner · Aug 21–31, 2026',
  description:
    'Day-by-day planner for the crew’s trip to Istanbul & Bodrum, August 21–31, 2026.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F4EFE8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <RegisterSW />
      </body>
    </html>
  )
}
