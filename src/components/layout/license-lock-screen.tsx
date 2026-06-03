'use client'

import { useEffect, useState, useCallback } from 'react'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ShieldX, Wifi, RefreshCw, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LicenseLockScreen() {
  const router = useRouter()
  const [locked, setLocked] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const checkStatus = useCallback(async () => {
    try {
      const status = await authApi.status()
      // Lock when license is invalid for ANY reason (revoked, expired, grace ended)
      setLocked(!status.valid)
      if (status.valid) setError('')
    } catch {
      // If we can't reach the backend, we're not locked (local mode)
      setLocked(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [checkStatus])

  // Subscribe to main-process license status push (Electron only)
  useEffect(() => {
    const electron = (window as any).electron
    if (!electron?.license?.onStatusChanged) return

    const unsubscribe = electron.license.onStatusChanged((status: any) => {
      if (status) {
        setLocked(!status.valid)
        if (status.valid) setError('')
      }
    })
    return unsubscribe
  }, [])

  const handleRenew = async () => {
    setRefreshing(true)
    setError('')
    try {
      // First try silent reactivation (no user input needed)
      try {
        await authApi.reactivate()
        await checkStatus()
        setRefreshing(false)
        return
      } catch {
        // Silent reactivation failed — fall through to refresh
      }

      // Try refresh token
      await authApi.refresh()
      await checkStatus()
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.includes('Machine not previously activated') || msg.includes('FULL_KEY_REQUIRED')) {
        setError('This device was never activated with this license. Please re-enter your license key.')
      } else if (msg.includes('revoke')) {
        setError('This license has been revoked. Please contact support.')
      } else {
        setError('Unable to renew license. Please check your internet connection or re-enter your license key.')
      }
    } finally {
      setRefreshing(false)
    }
  }

  const handleReactivate = () => {
    router.push('/activate')
  }

  if (!locked) return null

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
        <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8 text-danger" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">License Locked</h2>
        <p className="text-sm text-slate-500 mb-6">
          {error.includes('revoke')
            ? 'This license has been revoked by the administrator. Please contact support to resolve this issue.'
            : 'Your license has expired and the grace period has ended. Please connect to the internet to verify your license.'}
        </p>

        {error && (
          <div className="bg-danger-50 border border-danger/20 rounded-lg p-3 mb-4 text-sm text-danger">
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full mb-3"
          onClick={handleRenew}
          disabled={refreshing}
        >
          {refreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wifi className="w-4 h-4" />
          )}
          <span className="ml-2">{refreshing ? 'Connecting...' : 'Connect & Renew'}</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full mb-3"
          onClick={handleReactivate}
          disabled={refreshing}
        >
          <KeyRound className="w-4 h-4" />
          <span className="ml-2">Re-enter License Key</span>
        </Button>

        <p className="text-xs text-slate-400">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  )
}
