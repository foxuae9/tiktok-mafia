import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Street Fighter - FOXLIVE',
  description: 'تحديات ستريت فايتر على FOXLIVE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
