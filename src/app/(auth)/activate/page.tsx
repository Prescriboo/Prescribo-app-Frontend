'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Loader2, ClipboardPaste, ExternalLink } from 'lucide-react'

const SEGMENT_COUNT = 4
const LICENSE_REGEX = /^PRSC-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/

export default function ActivatePage() {
  const router = useRouter()
  const { activate, skipActivation } = useAuthStore()
  const { addToast } = useUIStore()
  const [keys, setKeys] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const fillKeys = useCallback((segments: string[]) => {
    const filled = segments.map((s) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))
    setKeys(filled)
  }, [])

  // Auto-paste from clipboard on mount
  useEffect(() => {
    const tryAutoPaste = async () => {
      try {
        const text = await navigator.clipboard.readText()
        const match = text.trim().match(LICENSE_REGEX)
        if (match) {
          fillKeys([match[1], match[2], match[3], match[4]])
          addToast('License key pasted from clipboard', 'success')
        }
      } catch {
        // Clipboard access denied or no matching content — silently ignore
      }
    }
    tryAutoPaste()
    // Focus first input after a short delay
    setTimeout(() => inputsRef.current[0]?.focus(), 100)
  }, [fillKeys, addToast])

  // Handle paste on the container
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').trim().toUpperCase()
    const match = pasted.match(LICENSE_REGEX)
    if (match) {
      e.preventDefault()
      fillKeys([match[1], match[2], match[3], match[4]])
      // Focus last input
      inputsRef.current[SEGMENT_COUNT - 1]?.focus()
    } else {
      // Try raw 16-char paste
      const raw = pasted.replace(/[^A-Z0-9]/g, '')
      if (raw.length === 16) {
        e.preventDefault()
        fillKeys([raw.slice(0, 4), raw.slice(4, 8), raw.slice(8, 12), raw.slice(12, 16)])
        inputsRef.current[SEGMENT_COUNT - 1]?.focus()
      }
    }
  }

  const handleChange = (index: number, value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    const newKeys = [...keys]
    newKeys[index] = clean
    setKeys(newKeys)
    if (clean.length === 4 && index < SEGMENT_COUNT - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && keys[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') handleActivate()
  }

  const handleActivate = async () => {
    if (!keys.every((k) => k.length === 4)) {
      addToast('Please enter a valid license key', 'error')
      return
    }
    const licenseKey = `PRSC-${keys.join('-')}`
    setLoading(true)
    try {
      await activate(licenseKey)
      addToast('License activated successfully!', 'success')
      setTimeout(() => router.push('/pin'), 600)
    } catch (err: any) {
      const msg = err.message || 'Activation failed'
      if (msg.includes('limit')) {
        addToast('Activation limit reached. Contact support to transfer your license.', 'error')
      } else if (msg.includes('another device') || msg.includes('admin support')) {
        setShowContactModal(true)
      } else if (msg.includes('revoke')) {
        addToast('This license has been revoked.', 'error')
      } else if (msg.includes('Invalid') || msg.includes('not found')) {
        addToast('Invalid license key. Please check and try again.', 'error')
      } else {
        addToast(msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    try {
      await skipActivation()
      addToast('Demo mode activated', 'info')
      router.push('/pin')
    } catch (err: any) {
      addToast(err.message || 'Demo activation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const allFilled = keys.every((k) => k.length === 4)

  return (
    <div className="bg-white border border-border rounded-2xl p-8 w-full max-w-xl shadow-2xl text-center relative z-10">
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

      {/* License key input */}
      <div
        ref={containerRef}
        className="flex items-center justify-center gap-1 mb-6 select-none"
        onPaste={handlePaste}
      >
        {/* Prefix */}
        <div className="w-16 h-12 flex items-center justify-center rounded-lg border-2 border-primary-100 bg-primary-50 text-primary text-lg font-bold uppercase tracking-widest">
          PRSC
        </div>
        <span className="text-lg font-bold text-slate-400">-</span>

        {/* Segments */}
        {keys.map((key, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              ref={(el) => { inputsRef.current[i] = el }}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="w-14 h-12 text-center text-lg font-bold border-2 border-border rounded-lg uppercase tracking-widest focus:border-primary focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 transition-all outline-none bg-white disabled:opacity-50"
              maxLength={4}
              value={key}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              placeholder="••••"
              disabled={loading}
            />
            {i < SEGMENT_COUNT - 1 && (
              <span className="text-lg font-bold text-slate-400">-</span>
            )}
          </div>
        ))}
      </div>

      {/* Helper text */}
      <p className="text-xs text-slate-400 mb-6 flex items-center justify-center gap-1.5">
        <ClipboardPaste size={12} />
        Copy a license key and it will paste automatically. Or press Ctrl+V anywhere.
      </p>

      {/* Activate button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleActivate}
        disabled={loading || !allFilled}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="ml-2">{loading ? 'Activating...' : 'Activate License'}</span>
      </Button>

      {/* Demo mode */}
      <Button
        variant="ghost"
        className="w-full mt-3 h-10 text-sm text-slate-500 hover:text-primary"
        onClick={handleDemo}
        disabled={loading}
      >
        Continue in Demo Mode
      </Button>

      <p className="mt-4 text-xs text-slate-400">Trial mode available for 14 days</p>

      {/* Contact Admin Support Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="License Already Activated"
        footer={
          <Button onClick={() => setShowContactModal(false)}>Close</Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This license is already in use on another device. To activate on this device, please contact admin support to transfer your license.
          </p>
          <a
            href="https://prescribo.in/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Go to Admin Dashboard
          </a>
          <p className="text-xs text-slate-400">
            Or reach out to your clinic administrator with your license key: <span className="font-mono font-medium text-slate-600">{keys.every(k => k.length === 4) ? `PRSC-${keys.join('-')}` : 'PRSC-XXXX-XXXX-XXXX-XXXX'}</span>
          </p>
        </div>
      </Modal>
    </div>
  )
}
