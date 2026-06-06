import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Prescribo - Desktop Prescription Generator",
  description: "Modern desktop prescription management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen w-screen overflow-hidden bg-bg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
