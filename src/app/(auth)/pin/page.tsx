'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'

export default function PinPage() {
  const router = useRouter()
  const { setPin, skipPin } = useAuthStore()
  const { addToast } = useUIStore()
  const [pinValue, setPinValue] = useState('')

  const enterDigit = (digit: number) => {
    if (pinValue.length < 4) {
      const newPin = pinValue + digit
      setPinValue(newPin)
      if (newPin.length === 4) {
        setTimeout(() => {
          setPin(newPin)
          addToast('PIN set successfully', 'success')
          setTimeout(() => router.push('/dashboard'), 400)
        }, 200)
      }
    }
  }

  const backspace = () => setPinValue(pinValue.slice(0, -1))
  const clear = () => setPinValue('')

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
            className="pin-key w-20 h-20 rounded-full border border-border bg-white text-xl font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all"
            onClick={() => enterDigit(d)}
          >
            {d}
          </button>
        ))}
        <button className="pin-key w-20 h-20 rounded-full border border-border bg-white text-sm font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all" onClick={clear}>CLR</button>
        <button className="pin-key w-20 h-20 rounded-full border border-border bg-white text-xl font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all" onClick={() => enterDigit(0)}>0</button>
        <button className="pin-key w-20 h-20 rounded-full border border-border bg-white text-xl font-semibold flex items-center justify-center hover:bg-primary-50 hover:border-primary-light hover:text-primary hover:scale-105 active:scale-90 active:bg-primary active:text-white transition-all" onClick={backspace}>&#x232B;</button>
      </div>
      <button className="mt-8 text-sm text-slate-400 hover:text-primary underline underline-offset-4 bg-transparent border-none cursor-pointer" onClick={() => { skipPin(); addToast('PIN setup skipped', 'info'); router.push('/dashboard') }}>
        Skip for now
      </button>
    </div>
  )
}
