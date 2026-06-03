'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { authApi } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const { isActivated, hasPin, hydrated, hydrateFromApi } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Try to hydrate auth state from backend before deciding where to route
    authApi.state()
      .then((state) => {
        hydrateFromApi(state)
      })
      .catch(() => {
        // Backend unreachable — stay with default empty state
      })
      .finally(() => {
        setChecking(false)
      })
  }, [hydrateFromApi])

  useEffect(() => {
    if (checking) return
    if (!isActivated) {
      router.push('/activate')
    } else if (hasPin) {
      router.push('/pin')
    } else {
      router.push('/dashboard')
    }
  }, [isActivated, hasPin, checking, router])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg">
      <div className="animate-pulse text-primary font-bold text-lg">Loading Prescribo...</div>
    </div>
  )
}
