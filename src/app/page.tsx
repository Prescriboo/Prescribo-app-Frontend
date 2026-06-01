'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export default function Home() {
  const router = useRouter()
  const { isActivated, hasPin } = useAuthStore()

  useEffect(() => {
    if (!isActivated) {
      router.push('/activate')
    } else if (hasPin) {
      router.push('/pin')
    } else {
      router.push('/dashboard')
    }
  }, [isActivated, hasPin, router])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg">
      <div className="animate-pulse text-primary font-bold text-lg">Loading Prescribo...</div>
    </div>
  )
}
