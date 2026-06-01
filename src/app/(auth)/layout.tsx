export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-white via-primary-50 to-teal-50 p-4" suppressHydrationWarning>
      {children}
    </div>
  )
}
