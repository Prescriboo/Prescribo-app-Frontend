'use client'

import { useEffect, useState, useCallback } from 'react'

interface Props {
  targetSelector: string
  onPositionReady?: (rect: DOMRect) => void
}

export default function TourOverlay({ targetSelector, onPositionReady }: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  const updateRect = useCallback(() => {
    const el = document.querySelector(targetSelector)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect(r)
      onPositionReady?.(r)
    }
  }, [targetSelector, onPositionReady])

  useEffect(() => {
    updateRect()
    const id = setInterval(updateRect, 300)
    window.addEventListener('resize', updateRect)
    return () => {
      clearInterval(id)
      window.removeEventListener('resize', updateRect)
    }
  }, [updateRect])

  if (!rect) return (
    <div className="fixed inset-0 z-[90] bg-black/50" />
  )

  const pad = 8
  const top = rect.top - pad
  const left = rect.left - pad
  const width = rect.width + pad * 2
  const height = rect.height + pad * 2

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {/* Spotlight cutout using box-shadow */}
      <div
        className="absolute rounded-xl"
        style={{
          top,
          left,
          width,
          height,
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Pulsing ring */}
        <div
          className="absolute -inset-2 rounded-2xl border-2 border-primary/60 animate-pulse"
          style={{ pointerEvents: 'none', animationDuration: '2s' }}
        />
      </div>
    </div>
  )
}
