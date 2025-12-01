import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'File Manager API - Appwrite',
  description: 'File Manager Pribadi Universal dengan Appwrite Storage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
