import { useState, useRef, useEffect, useId } from 'react'

import { type Component } from '@/react-shared'

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DropdownProps {
  className?: string
  options: DropdownOption[]
  value?: string
  placeholder?: string
  disabled?: boolean
  block?: boolean
  onChange?: (value: string) => void
}

const Dropdown: Component<DropdownProps> = props => {
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (open) {
      const idx = props.options.findIndex(o => o.value === props.value)
      setFocusIndex(idx >= 0 ? idx : 0)
    }
  }, [open, props.options, props.value])

  const select = (val: string): void => {
    if (val !== props.value) props.onChange?.(val)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent): void => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        if (open && focusIndex >= 0) {
          const opt = props.options[focusIndex]
          if (opt && !opt.disabled) select(opt.value)
        } else if (!props.disabled) {
          setOpen(true)
        }
        break
      case ' ':
        e.preventDefault()
        if (!props.disabled) setOpen(o => !o)
        break
      case 'Escape':
        e.stopPropagation()
        setOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { setOpen(true); break }
        setFocusIndex(i => Math.min(i + 1, props.options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) { setOpen(true); break }
        setFocusIndex(i => Math.max(i - 1, 0))
        break
      case 'Home':
        if (open) { e.preventDefault(); setFocusIndex(0) }
        break
      case 'End':
        if (open) { e.preventDefault(); setFocusIndex(props.options.length - 1) }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  const selected = props.options.find(o => o.value === props.value)
  const displayLabel = selected?.label ?? props.placeholder ?? ''

  return (
    <div
      ref={el => { wrapperRef.current = el }}
      className={`astroneum-dropdown ${props.block ? 'is-block' : ''} ${open ? 'is-open' : ''} ${props.disabled ? 'is-disabled' : ''} ${props.className ?? ''}`}
      tabIndex={props.disabled ? -1 : 0}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-activedescendant={open && focusIndex >= 0 ? `${listboxId}-opt-${focusIndex}` : undefined}
      onClick={() => { if (!props.disabled) setOpen(o => !o) }}
      onKeyDown={onKeyDown}>
      <div className="dropdown-trigger">
        <span className="dropdown-value">{displayLabel}</span>
        <svg className="dropdown-caret" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path d="M3.92 7.83 9 12.29l5.08-4.46-1-1.13L9 10.29l-4.09-3.6-.99 1.14Z"/>
        </svg>
      </div>
      {open && (
        <ul role="listbox" id={listboxId} className="dropdown-menu">
          {props.options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={opt.value === props.value}
              className={`dropdown-option ${opt.value === props.value ? 'is-selected' : ''} ${i === focusIndex ? 'is-focused' : ''} ${opt.disabled ? 'is-disabled' : ''}`}
              onClick={e => { e.stopPropagation(); if (!opt.disabled) select(opt.value) }}
              onMouseEnter={() => setFocusIndex(i)}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
