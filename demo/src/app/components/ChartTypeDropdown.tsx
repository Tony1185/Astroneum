'use client'

import './enhancements.css'
import { useState, useRef, useEffect, useCallback } from 'react'

export type ChartType = 'candle' | 'candle_stroke' | 'candle_up_stroke' | 'candle_down_stroke' | 'heikin_ashi' | 'ohlc' | 'area'

interface ChartTypeOption {
  value: ChartType
  label: string
  icon: React.ReactNode
  section: 'standard'
}

interface ChartTypeDropdownProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

const CHART_TYPES: ChartTypeOption[] = [
  {
    value: 'candle',
    label: 'Candles',
    section: 'standard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="6" width="4" height="8" fill="currentColor" rx="0.5"/>
        <line x1="6" y1="3" x2="6" y2="6" stroke="currentColor" strokeWidth="1"/>
        <line x1="6" y1="14" x2="6" y2="17" stroke="currentColor" strokeWidth="1"/>
        <rect x="12" y="4" width="4" height="10" fill="currentColor" rx="0.5"/>
        <line x1="14" y1="2" x2="14" y2="4" stroke="currentColor" strokeWidth="1"/>
        <line x1="14" y1="14" x2="14" y2="18" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    value: 'candle_stroke',
    label: 'Hollow Candles',
    section: 'standard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="6" width="4" height="8" fill="none" stroke="currentColor" strokeWidth="1" rx="0.5"/>
        <line x1="6" y1="3" x2="6" y2="6" stroke="currentColor" strokeWidth="1"/>
        <line x1="6" y1="14" x2="6" y2="17" stroke="currentColor" strokeWidth="1"/>
        <rect x="12" y="4" width="4" height="10" fill="none" stroke="currentColor" strokeWidth="1" rx="0.5"/>
        <line x1="14" y1="2" x2="14" y2="4" stroke="currentColor" strokeWidth="1"/>
        <line x1="14" y1="14" x2="14" y2="18" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    value: 'heikin_ashi',
    label: 'Heikin Ashi',
    section: 'standard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="7" width="5" height="6" fill="currentColor" rx="0.5"/>
        <line x1="5.5" y1="4" x2="5.5" y2="7" stroke="currentColor" strokeWidth="1"/>
        <line x1="5.5" y1="13" x2="5.5" y2="16" stroke="currentColor" strokeWidth="1"/>
        <rect x="11" y="5" width="5" height="8" fill="currentColor" rx="0.5"/>
        <line x1="13.5" y1="3" x2="13.5" y2="5" stroke="currentColor" strokeWidth="1"/>
        <line x1="13.5" y1="13" x2="13.5" y2="17" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    value: 'ohlc',
    label: 'Bars',
    section: 'standard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <line x1="6" y1="3" x2="6" y2="17" stroke="currentColor" strokeWidth="1"/>
        <line x1="4" y1="7" x2="6" y2="7" stroke="currentColor" strokeWidth="1"/>
        <line x1="6" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1"/>
        <line x1="14" y1="2" x2="14" y2="18" stroke="currentColor" strokeWidth="1"/>
        <line x1="12" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1"/>
        <line x1="14" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    value: 'area',
    label: 'Area',
    section: 'standard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14L6 10L10 12L14 6L18 8V16H2V14Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
]

export default function ChartTypeDropdown({ value, onChange }: ChartTypeDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentOption = CHART_TYPES.find(t => t.value === value) ?? CHART_TYPES[0]

  const handleChange = useCallback((type: ChartType) => {
    onChange(type)
    setOpen(false)
  }, [onChange])

  return (
    <div className="term-dropdown" ref={ref}>
      <button
        className="term-icon-btn"
        onClick={() => setOpen(v => !v)}
        title={`Chart type: ${currentOption.label}`}
        aria-label="Chart type"
        aria-expanded={open}
      >
        {currentOption.icon}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: -2 }}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="term-dropdown-menu">
          <div className="term-dropdown-section-label">Standard</div>
          {CHART_TYPES.map(opt => (
            <button
              key={opt.value}
              className={`term-dropdown-item ${value === opt.value ? 'is-active' : ''}`}
              onClick={() => handleChange(opt.value)}
            >
              <span className="term-dropdown-item-icon">{opt.icon}</span>
              <span className="term-dropdown-item-label">{opt.label}</span>
              {value === opt.value && (
                <svg className="term-dropdown-item-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
          <div className="term-dropdown-section-label" style={{ marginTop: 4 }}>Advanced Intraday</div>
          <div className="term-dropdown-item is-disabled">
            <span className="term-dropdown-item-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="6" height="5" fill="currentColor" rx="0.5"/>
                <rect x="11" y="8" width="6" height="4" fill="currentColor" rx="0.5"/>
                <rect x="3" y="12" width="6" height="4" fill="currentColor" rx="0.5"/>
              </svg>
            </span>
            <span className="term-dropdown-item-label">Renko</span>
          </div>
          <div className="term-dropdown-item is-disabled">
            <span className="term-dropdown-item-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 10L6 5L10 12L14 7L18 14" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              </svg>
            </span>
            <span className="term-dropdown-item-label">Kagi</span>
          </div>
          <div className="term-dropdown-item is-disabled">
            <span className="term-dropdown-item-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="6" width="4" height="8" fill="currentColor" rx="0.5"/>
                <rect x="9" y="4" width="4" height="12" fill="currentColor" rx="0.5"/>
                <rect x="15" y="8" width="2" height="4" fill="currentColor" rx="0.5"/>
              </svg>
            </span>
            <span className="term-dropdown-item-label">Range</span>
          </div>
          <div className="term-dropdown-item is-disabled">
            <span className="term-dropdown-item-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="6" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1.2"/>
                <text x="6" y="12" fontSize="4" fill="currentColor" textAnchor="middle">X</text>
                <circle cx="14" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1.2"/>
                <text x="14" y="12" fontSize="4" fill="currentColor" textAnchor="middle">O</text>
              </svg>
            </span>
            <span className="term-dropdown-item-label">Point &amp; Figure</span>
          </div>
        </div>
      )}
    </div>
  )
}
