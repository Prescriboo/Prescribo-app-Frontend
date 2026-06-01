'use client'

import React, { useState, useRef, useMemo, useEffect, useCallback, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'

interface MultiAutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  readOnly?: boolean
  className?: string
  onPressEnter?: () => void
}

export function MultiAutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  readOnly,
  className,
  onPressEnter,
}: MultiAutocompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedItems = useMemo(() => {
    if (!value.trim()) return new Set<string>()
    return new Set(value.split(', ').map((s) => s.trim().toLowerCase()).filter(Boolean))
  }, [value])

  const lastToken = useMemo(() => {
    const parts = value.split(', ')
    return parts[parts.length - 1].trim().toLowerCase()
  }, [value])

  const filtered = useMemo(() => {
    return options.filter((o) => {
      if (selectedItems.has(o.toLowerCase())) return false
      if (!lastToken) return true
      return o.toLowerCase().startsWith(lastToken)
    })
  }, [options, selectedItems, lastToken])

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filtered.length])

  const handleSelect = useCallback(
    (option: string) => {
      const parts = value.split(', ')
      const lastPart = parts[parts.length - 1].trim()
      const isLastComplete =
        options.some((o) => o.toLowerCase() === lastPart.toLowerCase()) || lastPart === ''

      if (isLastComplete) {
        if (lastPart === '') {
          parts[parts.length - 1] = option
        } else {
          parts.push(option)
        }
      } else {
        parts[parts.length - 1] = option
      }

      onChange(parts.join(', ') + ', ')
      // Keep dropdown open so user can pick more
    },
    [value, onChange, options]
  )

  const handleBlur = () => {
    // Small delay to allow click events on dropdown items to fire first
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false)
      }
    }, 150)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0 || lastToken.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (onPressEnter) {
          onPressEnter()
        } else {
          const trimmed = value.trimEnd()
          if (trimmed && !trimmed.endsWith(',')) {
            const newValue = trimmed + ', '
            onChange(newValue)
            requestAnimationFrame(() => {
              inputRef.current?.focus()
              const len = inputRef.current?.value.length || 0
              inputRef.current?.setSelectionRange(len, len)
            })
          }
        }
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev < filtered.length - 1 ? prev + 1 : 0
        scrollItemIntoView(next)
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filtered.length - 1
        scrollItemIntoView(next)
        return next
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(filtered[highlightedIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const scrollItemIntoView = (index: number) => {
    const list = listRef.current
    if (!list) return
    const item = list.children[index] as HTMLElement | undefined
    if (item) {
      item.scrollIntoView({ block: 'nearest' })
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {open && filtered.length > 0 && lastToken.length > 0 && !readOnly && (
        <div
          ref={listRef}
          className="absolute z-20 mt-1 w-full rounded-md border border-border bg-white shadow-lg max-h-48 overflow-y-auto"
        >
          {filtered.map((opt, idx) => (
            <div
              key={opt}
              className={cn(
                'px-3.5 py-2 text-sm cursor-pointer border-b border-slate-50 last:border-b-0',
                idx === highlightedIndex
                  ? 'bg-primary-50 text-primary'
                  : 'hover:bg-primary-50 hover:text-primary'
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(opt)
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
