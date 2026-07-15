'use client'

import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'
import { ChartTemplateManager, type AstroneumHandle, type ChartTemplate } from '@tony01/astroneum'

interface SaveLoadMenuProps {
  chartRef: RefObject<AstroneumHandle | null>
}

function formatSavedAt(value: string): string {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return ''
  const minutes = Math.floor((Date.now() - timestamp) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}h ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(timestamp)
}

function updatedAt(template: ChartTemplate): string {
  return template.updatedAt ?? template.createdAt
}

export default function SaveLoadMenu({ chartRef }: SaveLoadMenuProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Unnamed')
  const [templates, setTemplates] = useState<ChartTemplate[]>([])
  const [saveName, setSaveName] = useState('')
  const [status, setStatus] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
  const [pendingLoad, setPendingLoad] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    setTemplates(ChartTemplateManager.getInstance().getAll().sort((a, b) => updatedAt(b).localeCompare(updatedAt(a))))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const manager = ChartTemplateManager.getInstance()
    const activeName = manager.getActiveName()
    if (!activeName) return
    let timeout = 0
    const restore = () => {
      const chart = chartRef.current
      if (!chart || chart.getIndicators().length === 0) {
        timeout = window.setTimeout(restore, 100)
        return
      }
      if (manager.load(activeName, chart)) {
        setName(activeName)
        setStatus('saved')
      }
    }
    restore()
    return () => window.clearTimeout(timeout)
  }, [chartRef])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const chart = chartRef.current
      const saved = name === 'Unnamed' ? undefined : ChartTemplateManager.getInstance().get(name)
      if (chart && saved) setStatus(JSON.stringify(chart.serializeState()) === JSON.stringify(saved.state) ? 'saved' : 'dirty')
    }, 750)
    return () => window.clearInterval(timer)
  }, [chartRef, name])

  useEffect(() => {
    if (name === 'Unnamed' || status !== 'dirty') return
    const timer = window.setTimeout(() => {
      const chart = chartRef.current
      if (!chart) return
      setStatus('saving')
      try {
        const manager = ChartTemplateManager.getInstance()
        manager.save(name, chart.serializeState())
        manager.setActiveName(name)
        setStatus('saved')
        refresh()
      } catch { setStatus('error') }
    }, 1_500)
    return () => window.clearTimeout(timer)
  }, [chartRef, name, refresh, status])

  // Dismiss on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const save = useCallback(() => {
    const chart = chartRef.current
    if (!chart) return
    const trimmed = (saveName || name).trim()
    if (!trimmed || trimmed === 'Unnamed') return
    setStatus('saving')
    try {
      ChartTemplateManager.getInstance().save(trimmed, chart.serializeState())
      ChartTemplateManager.getInstance().setActiveName(trimmed)
      setName(trimmed)
      setSaveName('')
      setStatus('saved')
      refresh()
    } catch { setStatus('error') }
  }, [chartRef, name, refresh, saveName])

  const load = useCallback((n: string) => {
    const chart = chartRef.current
    if (!chart) return
    if (ChartTemplateManager.getInstance().load(n, chart)) {
      ChartTemplateManager.getInstance().setActiveName(n)
      setName(n)
      setStatus('saved')
    }
    setOpen(false)
  }, [chartRef])

  const remove = useCallback((n: string) => {
    try {
      ChartTemplateManager.getInstance().delete(n)
      if (n === name) {
        setName('Unnamed')
        setStatus('saved')
      }
      refresh()
    } catch { setStatus('error') }
  }, [name, refresh])

  const rename = useCallback((n: string) => {
    try {
      const template = ChartTemplateManager.getInstance().rename(n, renameValue)
      if (!template) {
        setStatus('error')
        return
      }
      if (n === name) setName(template.name)
      setRenaming(null)
      setRenameValue('')
      setStatus('saved')
      refresh()
    } catch { setStatus('error') }
  }, [name, refresh, renameValue])

  const duplicate = useCallback((n: string) => {
    try {
      if (!ChartTemplateManager.getInstance().duplicate(n)) {
        setStatus('error')
        return
      }
      refresh()
    } catch { setStatus('error') }
  }, [refresh])

  const clearChart = useCallback(() => {
    const chart = chartRef.current
    if (!chart) return
    chart.removeOverlay()
    ChartTemplateManager.getInstance().clearActiveName()
    setName('Unnamed')
    setOpen(false)
  }, [chartRef])

  return (
    <div className="term-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="term-btn term-saveload-btn"
        onClick={() => { setOpen(v => !v); refresh() }}
        title="Save / Load chart layout"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 3h11l3 3v11H3V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M6 3v4h6V3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <rect x="6" y="11" width="8" height="6" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        </svg>
        <span className="term-saveload-name">{name}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{ opacity: 0.6 }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="term-menu" role="menu">
          <div className="term-menu-row"><input aria-label="Layout name" value={saveName} placeholder={name === 'Unnamed' ? 'Layout name' : name} onChange={event => setSaveName(event.target.value)} /><button type="button" className="term-menu-item" role="menuitem" onClick={save}>{status === 'saving' ? 'Saving...' : status === 'error' ? 'Retry save' : 'Save'}</button></div>
          <button type="button" className="term-menu-item" role="menuitem" onClick={clearChart}>
            Clear drawings
          </button>
          {templates.length > 0 && (
            <>
              <div className="term-menu-sep" />
              <div className="term-menu-label">Saved layouts</div>
              {templates.map(template => renaming === template.name ? (
                <div key={template.id} className="term-menu-row term-menu-rename-row">
                  <input aria-label={`Rename ${template.name}`} autoFocus value={renameValue} onChange={event => setRenameValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') rename(template.name); if (event.key === 'Escape') setRenaming(null) }} />
                  <button type="button" className="term-menu-item" onClick={() => rename(template.name)}>Rename</button>
                  <button type="button" className="term-menu-icon" aria-label={`Cancel rename ${template.name}`} onClick={() => setRenaming(null)}><svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></button>
                </div>
              ) : (
                <div key={template.id} className="term-menu-row term-menu-layout-row">
                  <button
                    type="button"
                    className={`term-menu-item term-menu-item-grow${template.name === name ? ' is-active' : ''}`}
                    role="menuitem"
                    onClick={() => status === 'dirty' && template.name !== name ? setPendingLoad(template.name) : load(template.name)}
                  >
                    <span>{template.name}</span>
                    <time title={new Date(updatedAt(template)).toLocaleString()}>{formatSavedAt(updatedAt(template))}</time>
                  </button>
                  <div className="term-menu-row-actions">
                    <button type="button" className="term-menu-icon" title={`Duplicate ${template.name}`} aria-label={`Duplicate ${template.name}`} onClick={() => duplicate(template.name)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5" y="2" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5v8a1 1 0 001 1h6" stroke="currentColor" strokeWidth="1.2"/></svg>
                    </button>
                    <button type="button" className="term-menu-icon" title={`Rename ${template.name}`} aria-label={`Rename ${template.name}`} onClick={() => { setRenaming(template.name); setRenameValue(template.name) }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 11.5V13h1.5l7-7-1.5-1.5-7 7zM10.5 4.5l1.5 1.5.8-.8a1.06 1.06 0 000-1.5 1.06 1.06 0 00-1.5 0l-.8.8z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>
                    </button>
                    <button type="button" className="term-menu-icon term-menu-delete" title={`Delete ${template.name}`} aria-label={`Delete ${template.name}`} onClick={() => setPendingDelete(template.name)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4h10M6 4V2.5h4V4m-6 0 .7 9h6.6l.7-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      {pendingLoad && <div className="term-menu" role="dialog" aria-label="Unsaved changes"><div className="term-menu-label">Discard unsaved changes?</div><button type="button" className="term-menu-item" onClick={() => { load(pendingLoad); setPendingLoad(null) }}>Load layout</button><button type="button" className="term-menu-item" onClick={() => setPendingLoad(null)}>Cancel</button></div>}
      {pendingDelete && <div className="term-menu" role="dialog" aria-label="Delete layout"><div className="term-menu-label">Delete {pendingDelete}?</div><button type="button" className="term-menu-item term-menu-danger" onClick={() => { remove(pendingDelete); setPendingDelete(null) }}>Delete layout</button><button type="button" className="term-menu-item" onClick={() => setPendingDelete(null)}>Cancel</button></div>}
    </div>
  )
}
