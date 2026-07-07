import type { Metadata } from 'next'
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
