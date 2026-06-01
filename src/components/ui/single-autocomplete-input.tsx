'use client'

import React, { useState, useRef, useMemo, useEffect, useCallback, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'

interface SingleAutocompleteInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  readOnly?: boolean
  onPressEnter?: () => void
}

export function SingleAutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  readOnly,
  onPressEnter,
  className,
  ...divProps
}: SingleAutocompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const lastToken = useMemo(() => {
    return value.trim().toLowerCase()
  }, [value])

  const filtered = useMemo(() => {
    if (!lastToken) return []
    return options.filter((o) => o.toLowerCase().startsWith(lastToken))
  }, [options, lastToken])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [filtered.length])

  const handleSelect = useCallback(
    (option: string) => {
      onChange(option)
      setOpen(false)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    },
    [onChange]
  )

  const handleBlur = () => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false)
      }
    }, 150)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (filtered.length > 0) {
        e.preventDefault()
        setOpen(true)
        setHighlightedIndex((prev) => {
          const next = prev < filtered.length - 1 ? prev + 1 : 0
          scrollItemIntoView(next)
          return next
        })
      }
    } else if (e.key === 'ArrowUp') {
      if (filtered.length > 0 && open) {
        e.preventDefault()
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filtered.length - 1
          scrollItemIntoView(next)
          return next
        })
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && filtered.length > 0) {
        handleSelect(filtered[highlightedIndex])
      } else {
        onPressEnter?.()
      }
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
    <div ref={containerRef} className="relative" {...divProps}>
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
      {open && filtered.length > 0 && !readOnly && (
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
