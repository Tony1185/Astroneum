/**
 * WatchlistManager — client-side multi-watchlist manager.
 * Persists to localStorage under key 'astroneum-watchlists'.
 */

import type { Price, QuoteSnapshot, SymbolInfo, Volume } from '@/types'

const STORAGE_KEY = 'astroneum-watchlists'

export interface WatchSymbol {
  ticker: string
  name?: string
  shortName?: string
  exchange?: string
  pricePrecision?: number
  volumePrecision?: number
  logo?: string
  group?: string
  /** Injected externally — not stored. Branded Price ensures callers use asPrice() at ingress. */
  lastPrice?: Price
  change?: number
  changePercent?: number
  volume?: Volume
  open?: Price
  high?: Price
  low?: Price
}

export type WatchlistColumn = 'name' | 'last' | 'change' | 'changePercent' | 'volume' | 'open'
export type WatchlistSortDirection = 'asc' | 'desc'

export interface WatchlistSort {
  column: WatchlistColumn
  direction: WatchlistSortDirection
}

export interface Watchlist {
  id: string
  name: string
  symbols: WatchSymbol[]
  color?: string
  columns?: WatchlistColumn[]
  sort?: WatchlistSort
}

export type WatchlistsChangedCallback = (lists: Watchlist[]) => void

function uuid (): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export class WatchlistManager {
  private static _instance: WatchlistManager
  private _lists: Watchlist[] = []
  private _listeners: Set<WatchlistsChangedCallback> = new Set()

  private constructor () { this._load() }

  static getInstance (): WatchlistManager {
    if (!WatchlistManager._instance) WatchlistManager._instance = new WatchlistManager()
    return WatchlistManager._instance
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  onChange (cb: WatchlistsChangedCallback): () => void {
    this._listeners.add(cb)
    return () => { this._listeners.delete(cb) }
  }

  // ─── List management ──────────────────────────────────────────────────────

  getLists (): Watchlist[] { return this._lists }

  createList (name: string): Watchlist {
    const list: Watchlist = { id: uuid(), name: name.trim() || 'Watchlist', symbols: [] }
    this._lists.push(list)
    this._persist()
    return list
  }

  deleteList (id: string): void {
    this._lists = this._lists.filter(l => l.id !== id)
    this._persist()
  }

  renameList (id: string, name: string): void {
    const list = this._find(id)
    if (!list) return
    list.name = name.trim() || list.name
    this._persist()
  }

  reorderLists (from: number, to: number): void {
    if (from === to || from < 0 || to < 0 || from >= this._lists.length || to >= this._lists.length) return
    const [item] = this._lists.splice(from, 1)
    this._lists.splice(to, 0, item)
    this._persist()
  }

  // ─── Symbol management ────────────────────────────────────────────────────

  getSymbols (listId: string): WatchSymbol[] { return this._find(listId)?.symbols ?? [] }

  addSymbol (listId: string, symbol: WatchSymbol): void {
    const list = this._find(listId)
    if (!list) return
    if (list.symbols.some(s => s.ticker === symbol.ticker)) return
    list.symbols.push(this._storedSymbol(symbol))
    this._persist()
  }

  addSymbolFromInfo (listId: string, symbol: SymbolInfo): void {
    this.addSymbol(listId, {
      ticker: symbol.ticker,
      name: symbol.name,
      shortName: symbol.shortName,
      exchange: symbol.exchange,
      pricePrecision: symbol.pricePrecision,
      volumePrecision: symbol.volumePrecision,
      logo: symbol.logo,
      group: typeof symbol.group === 'string' ? symbol.group : undefined,
    })
  }

  removeSymbol (listId: string, ticker: string): void {
    const list = this._find(listId)
    if (!list) return
    list.symbols = list.symbols.filter(s => s.ticker !== ticker)
    this._persist()
  }

  reorderSymbols (listId: string, from: number, to: number): void {
    const list = this._find(listId)
    if (!list || from === to || from < 0 || to < 0 || from >= list.symbols.length || to >= list.symbols.length) return
    const [item] = list.symbols.splice(from, 1)
    list.symbols.splice(to, 0, item)
    this._persist()
  }

  moveSymbol (fromListId: string, toListId: string, ticker: string, toIndex?: number): void {
    const from = this._find(fromListId)
    const to = this._find(toListId)
    const index = from?.symbols.findIndex(symbol => symbol.ticker === ticker) ?? -1
    if (!from || !to || index < 0 || to.symbols.some(symbol => symbol.ticker === ticker)) return
    const [symbol] = from.symbols.splice(index, 1)
    const target = Math.max(0, Math.min(toIndex ?? to.symbols.length, to.symbols.length))
    to.symbols.splice(target, 0, symbol)
    this._persist()
  }

  setSort (listId: string, column: WatchlistColumn, direction?: WatchlistSortDirection): void {
    const list = this._find(listId)
    if (!list) return
    list.sort = direction ? { column, direction } : undefined
    this._persist()
  }

  setColumns (listId: string, columns: WatchlistColumn[]): void {
    const list = this._find(listId)
    if (!list) return
    list.columns = [...new Set(columns)]
    this._persist()
  }

  setColor (listId: string, color: string): void {
    const list = this._find(listId)
    if (!list) return
    list.color = color
    this._persist()
  }

  updateQuotes (snapshots: QuoteSnapshot[]): void {
    if (snapshots.length === 0) return
    const quotes = new Map(snapshots.map(snapshot => [snapshot.ticker, snapshot]))
    let changed = false
    for (const list of this._lists) {
      for (const symbol of list.symbols) {
        const quote = quotes.get(symbol.ticker)
        if (!quote) continue
        symbol.lastPrice = quote.last
        symbol.change = quote.change
        symbol.changePercent = quote.changePercent
        symbol.volume = quote.volume
        symbol.open = quote.open
        symbol.high = quote.high
        symbol.low = quote.low
        changed = true
      }
    }
    if (changed) this._emit()
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  private _find (id: string): Watchlist | undefined { return this._lists.find(l => l.id === id) }

  private _storedSymbol (symbol: WatchSymbol): WatchSymbol {
    return {
      ticker: symbol.ticker,
      name: symbol.name,
      shortName: symbol.shortName,
      exchange: symbol.exchange,
      pricePrecision: symbol.pricePrecision,
      volumePrecision: symbol.volumePrecision,
      logo: symbol.logo,
      group: symbol.group,
    }
  }

  private _emit (): void {
    this._listeners.forEach(cb => { cb(this._lists.map(list => ({ ...list, symbols: list.symbols.map(symbol => ({ ...symbol })) }))) })
  }

  private _persist (): void {
    try {
      const stored = this._lists.map(list => ({
        ...list,
        symbols: list.symbols.map(symbol => this._storedSymbol(symbol)),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch { /* quota exceeded — ignore */ }
    this._emit()
  }

  private _load (): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: Watchlist[] = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          this._lists = parsed.filter(list => list && typeof list.id === 'string' && typeof list.name === 'string').map(list => ({
            ...list,
            symbols: Array.isArray(list.symbols) ? list.symbols.filter(symbol => symbol && typeof symbol.ticker === 'string').map(symbol => this._storedSymbol(symbol)) : [],
          }))
        }
      }
    } catch { /* corrupt data — start fresh */ }

    // Always ensure at least one default list
    if (this._lists.length === 0) {
      this._lists.push({ id: uuid(), name: 'Watchlist', symbols: [] })
    }
  }
}

export default WatchlistManager
