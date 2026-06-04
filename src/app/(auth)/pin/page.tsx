'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Loader2 } from 'lucide-react'

export default function PinPage() {
  const router = useRouter()
  const { setPin, skipPin } = useAuthStore()
  const { addToast } = useUIStore()
  const [pinValue, setPinValue] = useState('')
  const [loading, setLoading] = useState(false)

  const enterDigit = (digit: number) => {
    if (pinValue.length < 4) {
      const newPin = pinValue + digit
      setPinValue(newPin)
      if (newPin.length === 4) {
        setTimeout(() => handleSetPin(newPin), 200)
      }
    }
  }

  const handleSetPin = async (finalPin: string) => {
    setLoading(true)
    try {
      await setPin(finalPin)
      addToast('PIN set successfully', 'success')
      setTimeout(() => router.push('/dashboard'), 400)
    } catch (err: any) {
      addToast(err.message || 'Failed to set PIN', 'error')
      setPinValue('')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      await skipPin()
      addToast('PIN setup skipped', 'info')
      router.push('/dashboard')
    } catch (err: any) {
      addToast(err.message || 'Failed to skip PIN', 'error')
    } finally {
      setLoading(false)
    }
  }

  const backspace = () => setPinValue((prev) => prev.slice(0, -1))
  const clear = () => setPinValue('')

  // Keyboard support for PIN entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        enterDigit(parseInt(e.key, 10))
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        backspace()
      } else if (e.key === 'Delete' || e.key === 'Escape') {
        e.preventDefault()
        clear()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (pinValue.length === 4) {
          handleSetPin(pinValue)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pinValue, loading])

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="flex-col items-center justify-center bg-white p-6 flex">
      <svg className="w-36 h-auto mb-8" viewBox="0 0 200 60" fill="none">
        <rect x="5" y="15" width="40" height="40" rx="8" fill="url(#g2)" />
        <path d="M15 25h20M15 35h20M15 45h12" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <text x="55" y="42" fontSize="28" fontWeight="800" fill="#1e3a8a">Prescribo</text>
        <defs>
          <linearGradient id="g2" x1="5" y1="15" x2="45" y2="55">
            <stop stopColor="#1d4ed8" /><stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <h2 className="text-xl font-bold mb-1">Enter PIN</h2>
      <p className="text-slate-400 text-sm mb-8">Secure your prescriptions with a 4-digit PIN</p>
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`pin-dot ${i < pinValue.length ? 'filled' : ''}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {digits.map((d) => (
          <button
            key={d}
            className="pin-key w-20 h-20 rounded-full border border-border bg-white text-xl font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all disabled:opacity-50"
            onClick={() => enterDigit(d)}
            disabled={loading}
          >
            {d}
          </button>
        ))}
        <button className="pin-key w-20 h-20 rounded-full border border-border bg-white text-sm font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all disabled:opacity-50" onClick={clear} disabled={loading}>CLR</button>
        <button className="pin-key w-20 h-20 rounded-full border border-border bg-white text-xl font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all disabled:opacity-50" onClick={() => enterDigit(0)} disabled={loading}>0</button>
        <button className="pin-key w-20 h-20 rounded-full border border-border bg-white text-xl font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all disabled:opacity-50" onClick={backspace} disabled={loading}>&#x232B;</button>
      </div>
      <button className="mt-8 text-sm text-slate-400 hover:text-primary underline underline-offset-4 bg-transparent border-none cursor-pointer disabled:opacity-50" onClick={handleSkip} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Skip for now'}
      </button>
    </div>
  )
}
