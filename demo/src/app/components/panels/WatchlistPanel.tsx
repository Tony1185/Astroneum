'use client'

import './panels.css'
import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { WatchlistManager, AlertManager, SymbolSearchModal, type Watchlist, type WatchSymbol, type WatchlistColumn, type Alert, type Datafeed } from '@tony01/astroneum'
import { AlertModal, type CandleData, type SymbolInfo, type IndicatorSourceOption } from '@tony01/astroneum'

const manager = WatchlistManager.getInstance()
const alertMgr = AlertManager.getInstance()

const CONDITION_LABELS: Record<string, string> = {
  above: '>',
  below: '<',
  crosses_above: '\u2197',
  crosses_below: '\u2198',
  crosses: '\u21C4',
  is_between: '\u2014',
}

interface WatchlistPanelProps {
  onSymbolSelect?: (ticker: string) => void
  selectedTicker?: string
  selectedSymbol?: SymbolInfo
  candle?: CandleData | null
  datafeed: Datafeed
  sidebarOpen: boolean
}

const DEFAULT_COLUMNS: WatchlistColumn[] = ['last', 'changePercent']
const ADVANCED_COLUMNS: WatchlistColumn[] = ['last', 'change', 'changePercent', 'volume', 'open']
const COLUMN_LABELS: Record<WatchlistColumn, string> = {
  name: 'Name',
  last: 'Last',
  change: 'Chg',
  changePercent: 'Chg%',
  volume: 'Vol',
  open: 'Open',
}
const LIST_COLORS = ['#6366f1', '#26a69a', '#ef5350', '#f7931a', '#787b86', '#8b5cf6']

function toSymbolInfo(symbol: WatchSymbol): SymbolInfo {
  return {
    ticker: symbol.ticker,
    name: symbol.name,
    shortName: symbol.shortName,
    exchange: symbol.exchange,
    pricePrecision: symbol.pricePrecision,
    volumePrecision: symbol.volumePrecision,
    logo: symbol.logo,
  }
}

export default function WatchlistPanel({ onSymbolSelect, selectedTicker, selectedSymbol, candle, datafeed, sidebarOpen }: WatchlistPanelProps) {
  const [lists, setLists] = useState<Watchlist[]>(manager.getLists())
  const [activeListId, setActiveListId] = useState<string>(manager.getLists()[0]?.id ?? '')
  const [section, setSection] = useState<'watchlist' | 'details' | 'news'>('watchlist')
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [draggedSymbol, setDraggedSymbol] = useState<{ listId: string; ticker: string; index: number } | null>(null)
  const [context, setContext] = useState<{ x: number; y: number; symbol: WatchSymbol } | null>(null)
  const [alertSymbol, setAlertSymbol] = useState<WatchSymbol | null>(null)
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [retryKey, setRetryKey] = useState(0)
  const [listMenuOpen, setListMenuOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    const unsub = manager.onChange(updated => {
      setLists([...updated])
      setActiveListId(current => updated.some(list => list.id === current) ? current : updated[0]?.id ?? '')
    })
    return unsub
  }, [])

  const activeList = lists.find(list => list.id === activeListId) ?? lists[0]
  const columns = activeList?.columns?.length ? activeList.columns : DEFAULT_COLUMNS
  const advanced = columns.some(column => column === 'volume' || column === 'open' || column === 'change')

  useEffect(() => {
    if (!sidebarOpen || section !== 'watchlist' || !activeList || !datafeed.getQuotes || activeList.symbols.length === 0) {
      setQuoteStatus('idle')
      return
    }
    let active = true
    const refresh = async () => {
      setQuoteStatus(status => status === 'ok' ? status : 'loading')
      try {
        const quotes = await datafeed.getQuotes!(activeList.symbols.map(toSymbolInfo))
        if (!active) return
        manager.updateQuotes(quotes)
        setQuoteStatus('ok')
      } catch {
        if (active) setQuoteStatus('error')
      }
    }
    void refresh()
    const interval = window.setInterval(() => { void refresh() }, 2000)
    return () => { active = false; window.clearInterval(interval) }
  }, [activeListId, activeList?.symbols.map(symbol => symbol.ticker).join('|'), datafeed, retryKey, section, sidebarOpen])

  useEffect(() => {
    if (!context && !settingsOpen && !listMenuOpen) return
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setContext(null)
      setSettingsOpen(false)
      setListMenuOpen(false)
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [context, settingsOpen, listMenuOpen])

  const commitRename = useCallback((id: string) => {
    manager.renameList(id, editingValue)
    setEditingId(null)
  }, [editingValue])

  const addList = () => {
    const list = manager.createList(`Watchlist ${lists.length + 1}`)
    manager.setColor(list.id, LIST_COLORS[lists.length % LIST_COLORS.length])
    setActiveListId(list.id)
  }

  const selectSymbol = (symbol: WatchSymbol) => onSymbolSelect?.(symbol.ticker)

  const setSort = (column: WatchlistColumn) => {
    if (!activeList) return
    const direction = activeList.sort?.column === column && activeList.sort.direction === 'asc' ? 'desc' : 'asc'
    manager.setSort(activeList.id, column, direction)
  }

  const sortedSymbols = [...(activeList?.symbols ?? [])].sort((a, b) => {
    const sort = activeList?.sort
    if (!sort) return 0
    const value = (symbol: WatchSymbol): string | number | undefined => {
      if (sort.column === 'name') return symbol.name ?? symbol.ticker
      if (sort.column === 'last') return symbol.lastPrice
      return symbol[sort.column]
    }
    const aValue = value(a)
    const bValue = value(b)
    if (aValue == null) return 1
    if (bValue == null) return -1
    const result = typeof aValue === 'string' ? aValue.localeCompare(String(bValue)) : Number(aValue) - Number(bValue)
    return sort.direction === 'asc' ? result : -result
  })

  const toggleColumn = (column: WatchlistColumn) => {
    if (!activeList) return
    const next = columns.includes(column) ? columns.filter(item => item !== column) : [...columns, column]
    manager.setColumns(activeList.id, next)
  }

  const deleteActiveList = () => {
    if (!activeList) return
    if (activeList.symbols.length > 0 && !window.confirm(`Delete ${activeList.name} and its ${activeList.symbols.length} symbols?`)) return
    manager.deleteList(activeList.id)
    setListMenuOpen(false)
  }

  const duplicateActiveList = () => {
    if (!activeList) return
    const duplicate = manager.createList(`${activeList.name} copy`)
    manager.setColor(duplicate.id, activeList.color ?? LIST_COLORS[lists.length % LIST_COLORS.length])
    manager.setColumns(duplicate.id, columns)
    for (const symbol of activeList.symbols) manager.addSymbol(duplicate.id, symbol)
    setActiveListId(duplicate.id)
    setListMenuOpen(false)
  }

  const exportActiveList = () => {
    if (!activeList) return
    const blob = new Blob([JSON.stringify(activeList, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeList.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'watchlist'}.json`
    link.click()
    URL.revokeObjectURL(url)
    setListMenuOpen(false)
  }

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const gridTemplate = `minmax(88px, 1fr) ${columns.filter(column => column !== 'name').map(() => 'minmax(54px, auto)').join(' ')}`

  return (
    <div className="term-watchlist" onClick={() => { setContext(null); setSettingsOpen(false); setListMenuOpen(false) }}>
      <div className="term-wl-section-tabs" role="tablist" aria-label="Market panel">
        {(['watchlist', 'details', 'news'] as const).map(item => <button key={item} role="tab" aria-selected={section === item} className={section === item ? 'is-active' : ''} onClick={event => { event.stopPropagation(); setSection(item) }}>{item[0].toUpperCase() + item.slice(1)}</button>)}
      </div>
      {section === 'details' && <DetailsPanel symbol={selectedSymbol} candle={candle} />}
      {section === 'news' && <div className="term-wl-empty"><strong>No news feed connected</strong><span>Connect a news provider to see stories for {selectedTicker ?? 'the active symbol'}.</span></div>}
      {section === 'watchlist' && <>
        <div className="term-wl-toolbar" onClick={event => event.stopPropagation()}>
          <button
            className="term-wl-list-selector"
            aria-haspopup="menu"
            aria-expanded={listMenuOpen}
            onClick={() => setListMenuOpen(value => !value)}>
            <span className="term-wl-color" style={{ backgroundColor: activeList?.color ?? LIST_COLORS[0] }} />
            <span className="term-wl-list-name">{activeList?.name ?? 'Watchlist'}</span>
            <svg className="term-wl-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" /></svg>
          </button>
          <button className="term-wl-icon-btn" onClick={() => setSearchOpen(true)} title="Add symbol" aria-label="Add symbol">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
          </button>
          <button className={`term-wl-icon-btn ${advanced ? 'is-active' : ''}`} aria-pressed={advanced} onClick={() => activeList && manager.setColumns(activeList.id, advanced ? DEFAULT_COLUMNS : ADVANCED_COLUMNS)} title="Advanced view" aria-label="Advanced view">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" /></svg>
          </button>
          <button className="term-wl-icon-btn" aria-expanded={settingsOpen} onClick={() => { setSettingsOpen(value => !value); setListMenuOpen(false) }} title="Settings" aria-label="Choose columns">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.14 7.14 0 0 0 .06-.94 7.14 7.14 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.7 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.14 7.14 0 0 0 0 1.88L2.82 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.42.32.6.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96c.24.1.5 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64z" /></svg>
          </button>
          {listMenuOpen && (
            <div className="term-wl-popover term-wl-list-menu" role="menu" aria-label="Watchlists">
              <div className="term-wl-list-menu-items">
                {lists.map(list => (
                  <button
                    key={list.id}
                    role="menuitemradio"
                    aria-checked={list.id === activeList?.id}
                    className={list.id === activeList?.id ? 'is-active' : ''}
                    onClick={() => { setActiveListId(list.id); setListMenuOpen(false) }}>
                    <span className="term-wl-color" style={{ backgroundColor: list.color ?? LIST_COLORS[lists.indexOf(list) % LIST_COLORS.length] }} />
                    {list.name}
                  </button>
                ))}
              </div>
              <div className="term-wl-list-menu-divider" />
              <button role="menuitem" onClick={() => { addList(); setListMenuOpen(false) }}>+ New list</button>
              <button role="menuitem" onClick={() => { if (activeList) { setEditingId(activeList.id); setEditingValue(activeList.name) } setListMenuOpen(false) }}>Rename</button>
              <button role="menuitem" onClick={duplicateActiveList}>Duplicate</button>
              <button role="menuitem" onClick={exportActiveList}>Export JSON</button>
              <div className="term-wl-color-picker" aria-label="List color">
                {LIST_COLORS.map(color => (
                  <button
                    key={color}
                    aria-label={`Set color ${color}`}
                    aria-pressed={activeList?.color === color}
                    style={{ backgroundColor: color }}
                    onClick={() => activeList && manager.setColor(activeList.id, color)} />
                ))}
              </div>
              <button role="menuitem" className="is-danger" onClick={deleteActiveList}>Delete</button>
            </div>
          )}
          {settingsOpen && <div className="term-wl-popover term-wl-columns" role="menu"><strong>Columns</strong>{(Object.keys(COLUMN_LABELS) as WatchlistColumn[]).map(column => <label key={column}><input type="checkbox" checked={columns.includes(column)} onChange={() => toggleColumn(column)} />{COLUMN_LABELS[column]}</label>)}<button onClick={() => activeList && manager.setColumns(activeList.id, DEFAULT_COLUMNS)}>Reset to default</button></div>}
        </div>
        {editingId === activeList?.id && <div className="term-wl-rename"><input value={editingValue} onChange={event => setEditingValue(event.target.value)} onBlur={() => commitRename(activeList.id)} onKeyDown={event => { if (event.key === 'Enter') commitRename(activeList.id); if (event.key === 'Escape') setEditingId(null) }} autoFocus /></div>}
        {quoteStatus === 'error' && <div className="term-wl-feed-error" role="status">Quotes unavailable <button onClick={() => setRetryKey(key => key + 1)}>Retry</button></div>}
        {activeList && activeList.symbols.length > 0 ? <div className="term-wl-table">
          <div className="term-wl-columns-header" style={{ gridTemplateColumns: gridTemplate }} role="row">
            <button role="columnheader" aria-sort={activeList.sort?.column === 'name' ? activeList.sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'} onClick={() => setSort('name')}>Symbol</button>
            {columns.filter(column => column !== 'name').map(column => <button key={column} role="columnheader" aria-sort={activeList.sort?.column === column ? activeList.sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'} onClick={() => setSort(column)}>{COLUMN_LABELS[column]}{activeList.sort?.column === column ? activeList.sort.direction === 'asc' ? ' ↑' : ' ↓' : ''}</button>)}
          </div>
          <div className="term-wl-rows" role="rowgroup">{sortedSymbols.map((symbol, index) => {
            const prevGroup = index > 0 ? sortedSymbols[index - 1].group : undefined
            const showGroup = symbol.group && symbol.group !== prevGroup
            const collapsed = symbol.group ? collapsedGroups.has(symbol.group) : false
            if (collapsed) return showGroup ? <div key={`group-${symbol.group}`} className="term-wl-group-header" onClick={() => toggleGroup(symbol.group!)}><svg className="term-wl-group-chevron is-collapsed" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" /></svg>{symbol.group}</div> : null
            return <Fragment key={symbol.ticker}>
              {showGroup && <div className="term-wl-group-header" onClick={() => toggleGroup(symbol.group!)}><svg className="term-wl-group-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" /></svg>{symbol.group}</div>}
              <WatchlistRow symbol={symbol} columns={columns} gridTemplate={gridTemplate} selected={symbol.ticker === selectedTicker} onSelect={() => selectSymbol(symbol)} onContextMenu={event => { event.preventDefault(); setContext({ x: event.clientX, y: event.clientY, symbol }) }} onDragStart={() => setDraggedSymbol({ listId: activeList.id, ticker: symbol.ticker, index })} onDrop={() => { if (draggedSymbol?.listId === activeList.id) manager.reorderSymbols(activeList.id, draggedSymbol.index, index); setDraggedSymbol(null) }} />
            </Fragment>
          })}</div>
        </div> : <div className="term-wl-empty"><strong>No symbols yet</strong><span>Add a market to start tracking live quotes.</span><button onClick={() => setSearchOpen(true)}>+ Add symbol</button></div>}
        {activeList && activeList.symbols.length > 0 && <button className="term-wl-add-symbol" onClick={() => setSearchOpen(true)}>+ Add symbol</button>}
      </>}
      {searchOpen && activeList && typeof document !== 'undefined' && createPortal(<SymbolSearchModal locale="en-US" searchSymbols={query => datafeed.searchSymbols(query)} onSymbolSelected={symbol => manager.addSymbolFromInfo(activeList.id, symbol)} onClose={() => setSearchOpen(false)} />, document.body)}
      {context && activeList && typeof document !== 'undefined' && createPortal(<div className="term-wl-context" role="menu" style={{ left: Math.min(context.x, window.innerWidth - 190), top: Math.min(context.y, window.innerHeight - 250) }} onClick={event => event.stopPropagation()}><button role="menuitem" onClick={() => { void navigator.clipboard.writeText(context.symbol.ticker); setContext(null) }}>Copy ticker</button><button role="menuitem" onClick={() => { setAlertSymbol(context.symbol); setContext(null) }}>Add alert</button>{lists.filter(list => list.id !== activeList.id).map(list => <button key={list.id} role="menuitem" onClick={() => { manager.moveSymbol(activeList.id, list.id, context.symbol.ticker); setContext(null) }}>Move to {list.name}</button>)}<button role="menuitem" className="is-danger" onClick={() => { manager.removeSymbol(activeList.id, context.symbol.ticker); setContext(null) }}>Remove</button></div>, document.body)}
      {alertSymbol && typeof document !== 'undefined' && createPortal(<AlertModal locale="en-US" symbol={alertSymbol.ticker} timeframe="D" currentPrice={alertSymbol.lastPrice} onSymbolChange={onSymbolSelect} onClose={() => setAlertSymbol(null)} />, document.body)}
    </div>
  )
}

function WatchlistRow({ symbol, columns, gridTemplate, selected, onSelect, onContextMenu, onDragStart, onDrop }: { symbol: WatchSymbol; columns: WatchlistColumn[]; gridTemplate: string; selected: boolean; onSelect: () => void; onContextMenu: (event: React.MouseEvent) => void; onDragStart: () => void; onDrop: () => void }) {
  const precision = symbol.pricePrecision ?? 2
  const formatNumber = (value: number | undefined, digits = precision) => value == null ? '\u2014' : value.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })
  const formatColumn = (column: WatchlistColumn) => {
    if (column === 'last') return formatNumber(symbol.lastPrice)
    if (column === 'change') return formatNumber(symbol.change)
    if (column === 'changePercent') return symbol.changePercent == null ? '\u2014' : `${symbol.changePercent >= 0 ? '+' : ''}${symbol.changePercent.toFixed(2)}%`
    if (column === 'volume') return symbol.volume == null ? '\u2014' : Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(symbol.volume)
    if (column === 'open') return formatNumber(symbol.open)
    return symbol.name ?? ''
  }
  const tone = symbol.changePercent == null ? '' : symbol.changePercent >= 0 ? 'up' : 'down'
  return <div role="row" tabIndex={0} aria-selected={selected} className={`term-wl-row ${selected ? 'is-selected' : ''}`} style={{ gridTemplateColumns: gridTemplate }} draggable onDragStart={onDragStart} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); onDrop() }} onClick={onSelect} onDoubleClick={() => onSelect()} onContextMenu={onContextMenu} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect() } if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); onContextMenu({ preventDefault: () => {}, clientX: rect.left + 20, clientY: rect.top + 20 } as React.MouseEvent) } }}>
    <span className="term-wl-symbol"><strong>{symbol.shortName ?? symbol.ticker.split(':').pop()}</strong>{columns.includes('name') && <small>{symbol.name ?? symbol.exchange}</small>}</span>
    {columns.filter(column => column !== 'name').map(column => <span key={column} role="cell" className={`term-wl-value ${column === 'change' || column === 'changePercent' ? tone : ''}`}>{formatColumn(column)}</span>)}
  </div>
}

export function DetailsPanel({ symbol, candle }: { symbol?: SymbolInfo; candle?: CandleData | null }) {
  const precision = symbol?.pricePrecision ?? 2
  const format = (value: number | undefined) => value == null ? '\u2014' : value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })
  const change = candle ? candle.close - candle.open : undefined
  const changePercent = candle && candle.open !== 0 ? (change! / candle.open) * 100 : undefined

  return (
    <div className="term-details">
      <div className="term-details-symbol">
        <strong>{symbol?.ticker ?? 'No symbol selected'}</strong>
        <span>{symbol?.name ?? symbol?.shortName ?? symbol?.exchange ?? 'Live market data'}</span>
      </div>
      <div className="term-details-grid">
        <Detail label="Last" value={format(candle?.close)} />
        <Detail label="Change" value={change == null ? '\u2014' : `${change >= 0 ? '+' : ''}${format(change)} (${changePercent?.toFixed(2)}%)`} tone={change == null ? undefined : change >= 0 ? 'up' : 'down'} />
        <Detail label="Open" value={format(candle?.open)} />
        <Detail label="High" value={format(candle?.high)} />
        <Detail label="Low" value={format(candle?.low)} />
        <Detail label="Volume" value={candle?.volume == null ? '\u2014' : candle.volume.toLocaleString()} />
      </div>
      <p className="term-details-note">Fundamentals and position P&amp;L require connected data sources.</p>
    </div>
  )
}

function Detail({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return <div className="term-detail"><span>{label}</span><strong className={tone ? `is-${tone}` : ''}>{value}</strong></div>
}

// ── AlertsPanel — TV-mirrored right rail panel ──

interface AlertsPanelProps {
  symbol?: string
  getCurrentPrice?: () => number | undefined
  indicatorSources?: IndicatorSourceOption[]
  onSymbolChange?: (symbol: string) => void
}

function symbolLogoUrl(symbol: string): string {
  const base = symbol.replace(/USDT$|USD$|PERP$|\.P$/i, '')
  return `https://s3-symbol-logo.tradingview.com/crypto/XTVC${base.toUpperCase()}.svg`
}

const STATUS_META: Record<string, { label: string; color: string; glyph: string }> = {
  active: { label: 'Active', color: '#26a69a', glyph: '\u25CF' },
  paused: { label: 'Paused', color: '#787b86', glyph: '\u23F8' },
  triggered: { label: 'Triggered', color: '#f89d3e', glyph: '\u25B2' },
  expired: { label: 'Expired', color: '#787b86', glyph: '\u25CB' },
  dismissed: { label: 'Dismissed', color: '#787b86', glyph: '\u00D7' },
}

export function AlertsPanel({ symbol = 'BTCUSDT', getCurrentPrice, indicatorSources, onSymbolChange }: AlertsPanelProps = {}) {
  const [alerts, setAlerts] = useState<Alert[]>([...alertMgr.getAll()])
  const [tab, setTab] = useState<'alerts' | 'log'>('alerts')
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'current'>('all')
  const [editTarget, setEditTarget] = useState<Alert | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = alertMgr.onChange(updated => setAlerts([...updated]))
    return unsub
  }, [])

  const livePrice = getCurrentPrice?.()

  const filtered = useCallback((list: Alert[]) => {
    let result = list
    if (filterMode === 'current') {
      result = result.filter(a => a.symbol === symbol)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(a =>
        a.symbol.toLowerCase().includes(q) ||
        (a.note?.toLowerCase().includes(q) ?? false) ||
        String(a.price).includes(q))
    }
    return result
  }, [filterMode, search, symbol])

  const activeAlerts = filtered(alerts.filter(a => a.status === 'active' || a.status === 'paused'))
  const logAlerts = filtered(alerts.filter(a => a.status === 'triggered' || a.status === 'expired' || a.status === 'dismissed'))

  const openCreate = () => { setEditTarget(null); setShowDialog(true) }
  const openEdit = (alert: Alert) => { setEditTarget(alert); setShowDialog(true) }

  const handleDelete = (id: string) => { alertMgr.delete(id) }
  const handleTogglePause = (id: string) => { alertMgr.togglePause(id) }
  const handleReactivate = (id: string) => { alertMgr.reactivate(id) }
  const handleClearLog = () => {
    for (const a of logAlerts) alertMgr.delete(a.id)
  }

  const dialog = showDialog && typeof document !== 'undefined'
    ? createPortal(
        <AlertModal
          locale="en-US"
          symbol={symbol}
          timeframe="D"
          currentPrice={livePrice}
          editAlert={editTarget ?? undefined}
          indicatorSources={indicatorSources}
          onSymbolChange={onSymbolChange}
          onClose={() => { setShowDialog(false); setEditTarget(null) }}
        />,
        document.body,
      )
    : null

  const totalCount = activeAlerts.length + logAlerts.length

  return (
    <div className="term-alerts-panel">
      <div className="term-alerts-toolbar">
        <span className="term-alerts-toolbar-title">Alerts</span>
        <span className="term-alerts-count">{totalCount}</span>
        <div className="term-alerts-toolbar-spacer" />
        <button
          className="term-alerts-create-btn"
          onClick={openCreate}
          title="Create alert">+ Create</button>
      </div>

      <div className="term-alerts-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'alerts'}
          className={`term-alerts-tab ${tab === 'alerts' ? 'is-active' : ''}`}
          onClick={() => setTab('alerts')}>
          Alerts ({activeAlerts.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'log'}
          className={`term-alerts-tab ${tab === 'log' ? 'is-active' : ''}`}
          onClick={() => setTab('log')}>
          Log ({logAlerts.length})
        </button>
      </div>

      <div className="term-alerts-filters">
        <input
          className="term-alerts-search"
          placeholder="Search alerts\u2026"
          value={search}
          onChange={e => setSearch(e.target.value)}/>
        <button
          className={`term-alerts-filter-btn ${filterMode === 'current' ? 'is-active' : ''}`}
          onClick={() => setFilterMode(m => m === 'all' ? 'current' : 'all')}
          title={filterMode === 'all' ? 'All symbols' : 'Current symbol only'}>
          {filterMode === 'all' ? 'All' : symbol}
        </button>
      </div>

      <div className="term-alerts-list" ref={scrollRef}>
        {tab === 'alerts' ? (
          activeAlerts.length > 0 ? (
            activeAlerts.map(alert => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onEdit={() => openEdit(alert)}
                onDelete={() => handleDelete(alert.id)}
                onTogglePause={() => handleTogglePause(alert.id)}
                onReactivate={() => handleReactivate(alert.id)}/>
            ))
          ) : (
            <div className="term-alerts-empty-section">
              <div className="term-alerts-empty-text">No active alerts</div>
              <button className="term-alerts-empty-create" onClick={openCreate}>+ Create alert</button>
            </div>
          )
        ) : (
          logAlerts.length > 0 ? (
            <>
              <button className="term-alerts-clear-log" onClick={handleClearLog}>Clear log</button>
              {logAlerts.map(alert => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onEdit={() => openEdit(alert)}
                  onDelete={() => handleDelete(alert.id)}
                  onTogglePause={() => handleTogglePause(alert.id)}
                  onReactivate={() => handleReactivate(alert.id)}/>
              ))}
            </>
          ) : (
            <div className="term-alerts-empty-section">
              <div className="term-alerts-empty-text">No alerts triggered yet</div>
            </div>
          )
        )}
      </div>
      {dialog}
    </div>
  )
}

function AlertRow({ alert, onEdit, onDelete, onTogglePause, onReactivate }: {
  alert: Alert
  onEdit: () => void
  onDelete: () => void
  onTogglePause: () => void
  onReactivate: () => void
}) {
  const [logoError, setLogoError] = useState(false)
  const meta = STATUS_META[alert.status] ?? STATUS_META.active
  const tf = alert.timeframe
  const logoUrl = symbolLogoUrl(alert.symbol)
  const condText = alert.conditions?.map(c => {
    const srcLabel = c.source.type === 'price' ? '' : `${c.source.shortName ?? c.source.name} `
    return `${srcLabel}${CONDITION_LABELS[c.operator] ?? c.operator} ${c.value}${c.secondValue !== undefined ? `\u2013${c.secondValue}` : ''}`
  }).join(' AND ') ?? `${CONDITION_LABELS[alert.condition] ?? alert.condition} ${alert.price}`

  const notifIcons: string[] = []
  if (alert.soundEnabled) notifIcons.push('\u266B')
  if (alert.notificationEnabled) notifIcons.push('\u2709')
  if (alert.toastEnabled) notifIcons.push('\u26A1')
  if (alert.webhookUrl) notifIcons.push('W')
  if (alert.emailEnabled) notifIcons.push('@')

  return (
    <div className="term-alert-row-tv" onClick={onEdit}>
      <div className="term-alert-row-status" style={{ color: meta.color }} title={meta.label}>
        <span className="term-alert-status-glyph">{meta.glyph}</span>
        <span className="term-alert-status-label">{meta.label}</span>
      </div>
      {!logoError ? (
        <img
          className="term-alert-row-logo"
          src={logoUrl}
          alt=""
          crossOrigin="anonymous"
          onError={() => setLogoError(true)}/>
      ) : (
        <span className="term-alert-row-letter">{alert.symbol.charAt(0)}</span>
      )}
      <div className="term-alert-row-body">
        <div className="term-alert-row-symbol">
          {alert.symbol}{tf ? `, ${tf}` : ''}
          {notifIcons.length > 0 && <span className="term-alert-row-notifs">{notifIcons.join(' ')}</span>}
        </div>
        <div className="term-alert-row-cond">{condText}</div>
        {alert.note && <div className="term-alert-row-note">{alert.note}</div>}
        {alert.triggeredAt && (
          <div className="term-alert-row-triggered">
            {new Date(alert.triggeredAt).toLocaleString()}
          </div>
        )}
        {alert.webhookUrl && alert.webhookStatus && (
          <div className={`term-alert-row-webhook term-alert-webhook-${alert.webhookStatus}`}>
            Webhook {alert.webhookStatus}{typeof alert.webhookHttpStatus === 'number' ? ` \u00B7 ${alert.webhookHttpStatus}` : ''}
          </div>
        )}
      </div>
      <div className="term-alert-row-actions" onClick={e => e.stopPropagation()}>
        {alert.status === 'triggered' && (
          <button className="term-alert-action-btn" onClick={onReactivate} title="Reactivate">&#8635;</button>
        )}
        {(alert.status === 'active' || alert.status === 'paused') && (
          <button className="term-alert-action-btn" onClick={onTogglePause} title={alert.status === 'paused' ? 'Resume' : 'Pause'}>
            {alert.status === 'paused' ? '\u25B6' : '\u23F8'}
          </button>
        )}
        <button className="term-alert-action-btn delete" onClick={onDelete} title="Delete">&times;</button>
      </div>
    </div>
  )
}
