'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ActivatePage() {
  const router = useRouter()
  const { activate, skipActivation } = useAuthStore()
  const { addToast } = useUIStore()
  const [keys, setKeys] = useState(['ABCD', '1234', 'EFGH'])
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    const newKeys = [...keys]
    newKeys[index] = clean
    setKeys(newKeys)
    if (clean.length === 4 && index < 2) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && keys[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') handleActivate()
  }

  const handleActivate = () => {
    if (keys.every(k => k.length === 4)) {
      activate(`PR-${keys.join('-')}`)
      addToast('License activated successfully!', 'success')
      setTimeout(() => router.push('/pin'), 600)
    } else {
      addToast('Please enter a valid license key', 'error')
    }
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-8 w-full max-w-lg shadow-2xl text-center relative z-10">
      <svg className="w-44 h-auto mx-auto mb-6" viewBox="0 0 200 60" fill="none">
        <rect x="5" y="15" width="40" height="40" rx="8" fill="url(#g1)" />
        <path d="M15 25h20M15 35h20M15 45h12" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <text x="55" y="42" fontSize="28" fontWeight="800" fill="#1e3a8a">Prescribo</text>
        <defs>
          <linearGradient id="g1" x1="5" y1="15" x2="45" y2="55">
            <stop stopColor="#1d4ed8" /><stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <h2 className="text-xl font-bold mb-1">Activate Prescribo</h2>
      <p className="text-slate-500 text-sm mb-6">Enter your license key to unlock the full version.</p>
      <div className="flex items-center justify-center gap-1.5 mb-6 flex-wrap">
        <Input className="w-16 h-12 text-center text-lg font-bold border-2 border-primary-100 bg-primary-50 text-primary uppercase tracking-widest" value="PR" readOnly tabIndex={-1} />
        <span className="text-lg font-bold text-slate-400">-</span>
        {keys.map((key, i) => (
          <Input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}
            className="key-seg w-16 h-12 text-center text-lg font-bold border-2 border-border uppercase tracking-widest focus:border-primary focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 transition-all"
            maxLength={4}
            value={key}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            placeholder="XXXX"
          />
        ))}
        <span className="text-lg font-bold text-slate-400">-</span>
        <Input className="w-16 h-12 text-center text-lg font-bold border-2 border-border uppercase tracking-widest focus:border-primary focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 transition-all" maxLength={4} value={keys[1]} onChange={(e) => handleChange(1, e.target.value)} onKeyDown={(e) => handleKeyDown(1, e)} placeholder="XXXX" />
        <span className="text-lg font-bold text-slate-400">-</span>
        <Input className="w-16 h-12 text-center text-lg font-bold border-2 border-border uppercase tracking-widest focus:border-primary focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 transition-all" maxLength={4} value={keys[2]} onChange={(e) => handleChange(2, e.target.value)} onKeyDown={(e) => handleKeyDown(2, e)} placeholder="XXXX" />
      </div>
      <Button size="lg" className="w-full" onClick={handleActivate}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        Activate License
      </Button>
      <Button variant="ghost" className="w-full mt-3 h-10 text-sm text-slate-500 hover:text-primary" onClick={() => { skipActivation(); addToast('Demo mode activated', 'info'); router.push('/pin') }}>
        Continue in Demo Mode
      </Button>
      <p className="mt-4 text-xs text-slate-400">Trial mode available for 14 days</p>
    </div>
  )
}
