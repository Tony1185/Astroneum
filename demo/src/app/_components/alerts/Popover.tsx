'use client'

import { useState, useRef, useEffect } from 'react'
import './alert-dialog.css'

export interface PopoverOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
}

interface PopoverProps {
  options: PopoverOption[]
  value: string
  onChange: (value: string) => void
  triggerClassName?: string
  triggerStyle?: React.CSSProperties
  renderTrigger?: (selected: PopoverOption | undefined) => React.ReactNode
  align?: 'left' | 'right'
  width?: number
  ariaLabel?: string
}

export default function Popover({
  options,
  value,
  onChange,
  triggerClassName,
  triggerStyle,
  renderTrigger,
  align = 'left',
  width,
  ariaLabel,
}: PopoverProps) {
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) { setHighlightIdx(-1); return }
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); e.stopPropagation() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, options.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)) }
      else if (e.key === 'Enter') {
        e.preventDefault()
        if (highlightIdx >= 0 && highlightIdx < options.length) {
          onChange(options[highlightIdx].value)
          setOpen(false)
          triggerRef.current?.focus()
        }
      }
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  }, [open, highlightIdx, options, onChange])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    [align === 'right' ? 'right' : 'left']: 0,
    width: width ?? '100%',
    zIndex: 200,
  }

  return (
    <div className="ad-popover-wrap" style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName ?? 'ad-dropdown'}
        style={triggerStyle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
      >
        {renderTrigger
          ? renderTrigger(selected)
          : (
            <>
              <span className="ad-dropdown-label">
                {selected?.icon}
                {selected?.label ?? value}
              </span>
              <span className="caret">&#9662;</span>
            </>
          )
        }
      </button>
      {open && (
        <div ref={menuRef} className="ad-popover-menu" style={menuStyle} role="menu">
          {options.map((opt, i) => (
            <div
              key={opt.value}
              className={`ad-popover-item${i === highlightIdx ? ' hover' : ''}${opt.value === value ? ' selected' : ''}`}
              role="menuitem"
              tabIndex={-1}
              onPointerEnter={() => setHighlightIdx(i)}
              onClick={(e) => { e.stopPropagation(); handleSelect(opt.value) }}
            >
              <span className="ad-popover-item-icon">{opt.icon}</span>
              <span className="ad-popover-item-label">{opt.label}</span>
              {opt.description && <span className="ad-popover-item-desc">{opt.description}</span>}
              {opt.value === value && (
                <span className="ad-popover-check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
