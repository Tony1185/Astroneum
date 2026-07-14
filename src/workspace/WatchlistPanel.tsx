import { useEffect, useState } from 'react'

import WatchlistManager, { type Watchlist, type WatchlistColumn, type WatchSymbol } from '@/chart/WatchlistManager'
import SymbolSearchModal from '@/widget/symbol-search-modal'
import { type Datafeed, type SymbolInfo } from '@/types'

export interface WorkspaceWatchlistProps {
  datafeed: Datafeed
  selectedTicker?: string
  open?: boolean
  onSymbolSelect?: (ticker: string) => void
}

const DEFAULT_COLUMNS: WatchlistColumn[] = ['last', 'changePercent']
const COLUMN_LABELS: Record<WatchlistColumn, string> = {
  name: 'Name', last: 'Last', change: 'Chg', changePercent: 'Chg%', volume: 'Vol', open: 'Open',
}

function toSymbolInfo (symbol: WatchSymbol): SymbolInfo {
  return {
    ticker: symbol.ticker,
    name: symbol.name,
    shortName: symbol.shortName,
    exchange: symbol.exchange,
    pricePrecision: symbol.pricePrecision,
    volumePrecision: symbol.volumePrecision,
  }
}

function formatValue (symbol: WatchSymbol, column: WatchlistColumn): string {
  if (column === 'name') return symbol.name ?? symbol.exchange ?? ''
  if (column === 'changePercent') return symbol.changePercent == null ? '-' : `${symbol.changePercent >= 0 ? '+' : ''}${symbol.changePercent.toFixed(2)}%`
  if (column === 'volume') return symbol.volume == null ? '-' : Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(symbol.volume)
  const value = column === 'last' ? symbol.lastPrice : symbol[column]
  return value == null ? '-' : Number(value).toLocaleString(undefined, { maximumFractionDigits: symbol.pricePrecision ?? 2, minimumFractionDigits: symbol.pricePrecision ?? 2 })
}

export default function WorkspaceWatchlist ({ datafeed, selectedTicker, open = true, onSymbolSelect }: WorkspaceWatchlistProps) {
  const manager = WatchlistManager.getInstance()
  const [lists, setLists] = useState<Watchlist[]>(manager.getLists())
  const [activeId, setActiveId] = useState(manager.getLists()[0]?.id ?? '')
  const [searchOpen, setSearchOpen] = useState(false)
  const [quoteError, setQuoteError] = useState(false)

  useEffect(() => manager.onChange(next => {
    setLists([...next])
    setActiveId(current => next.some(list => list.id === current) ? current : next[0]?.id ?? '')
  }), [manager])

  const active = lists.find(list => list.id === activeId) ?? lists[0]
  const columns = active?.columns?.length ? active.columns : DEFAULT_COLUMNS

  useEffect(() => {
    if (!open || !active || !datafeed.getQuotes || active.symbols.length === 0) return
    let cancelled = false
    const refresh = async (): Promise<void> => {
      try {
        manager.updateQuotes(await datafeed.getQuotes!(active.symbols.map(toSymbolInfo)))
        if (!cancelled) setQuoteError(false)
      } catch {
        if (!cancelled) setQuoteError(true)
      }
    }
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 2000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [active?.id, active?.symbols.map(symbol => symbol.ticker).join('|'), datafeed, manager, open])

  const sorted = [...(active?.symbols ?? [])].sort((left, right) => {
    const sort = active?.sort
    if (!sort) return 0
    const value = (symbol: WatchSymbol): string | number | undefined => sort.column === 'name' ? symbol.name ?? symbol.ticker : sort.column === 'last' ? symbol.lastPrice : symbol[sort.column]
    const a = value(left)
    const b = value(right)
    if (a == null) return 1
    if (b == null) return -1
    const result = typeof a === 'string' ? a.localeCompare(String(b)) : Number(a) - Number(b)
    return sort.direction === 'asc' ? result : -result
  })

  const sort = (column: WatchlistColumn): void => {
    if (!active) return
    manager.setSort(active.id, column, active.sort?.column === column && active.sort.direction === 'asc' ? 'desc' : 'asc')
  }

  const addList = (): void => {
    const next = manager.createList(`Watchlist ${lists.length + 1}`)
    setActiveId(next.id)
  }

  const grid = `minmax(96px, 1fr) ${columns.filter(column => column !== 'name').map(() => 'minmax(58px, auto)').join(' ')}`

  return (
    <section className="astroneum-workspace-watchlist" aria-label="Watchlist">
      <header className="astroneum-workspace-watchlist-header">
        <select value={active?.id ?? ''} onChange={event => setActiveId(event.target.value)} aria-label="Select watchlist">
          {lists.map(list => <option key={list.id} value={list.id}>{list.name}</option>)}
        </select>
        <button onClick={() => setSearchOpen(true)}>Add</button>
        <button onClick={addList}>New</button>
      </header>
      {quoteError && <div className="astroneum-workspace-watchlist-error" role="status">Quotes unavailable</div>}
      {active && active.symbols.length > 0 ? <div className="astroneum-workspace-watchlist-table">
        <div className="astroneum-workspace-watchlist-columns" style={{ gridTemplateColumns: grid }} role="row">
          <button role="columnheader" onClick={() => sort('name')}>Symbol</button>
          {columns.filter(column => column !== 'name').map(column => <button key={column} role="columnheader" onClick={() => sort(column)}>{COLUMN_LABELS[column]}</button>)}
        </div>
        <div role="rowgroup">
          {sorted.map(symbol => <button key={symbol.ticker} className={symbol.ticker === selectedTicker ? 'is-selected' : ''} style={{ gridTemplateColumns: grid }} role="row" onClick={() => onSymbolSelect?.(symbol.ticker)}>
            <span><strong>{symbol.shortName ?? symbol.ticker}</strong>{columns.includes('name') && <small>{formatValue(symbol, 'name')}</small>}</span>
            {columns.filter(column => column !== 'name').map(column => <span key={column} className={column === 'changePercent' && symbol.changePercent != null ? symbol.changePercent >= 0 ? 'is-up' : 'is-down' : ''}>{formatValue(symbol, column)}</span>)}
          </button>)}
        </div>
      </div> : <div className="astroneum-workspace-watchlist-empty"><strong>No symbols yet</strong><button onClick={() => setSearchOpen(true)}>Add symbol</button></div>}
      {searchOpen && active && <SymbolSearchModal locale="en-US" searchSymbols={query => datafeed.searchSymbols(query)} onSymbolSelected={symbol => manager.addSymbolFromInfo(active.id, symbol)} onClose={() => setSearchOpen(false)} />}
    </section>
  )
}
