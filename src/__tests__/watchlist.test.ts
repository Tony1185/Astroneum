import test from 'node:test'
import assert from 'node:assert/strict'

import { WatchlistManager } from '../chart/WatchlistManager'
import { asPrice, asVolume } from '../utils'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
  removeItem(key: string): void { this.values.delete(key) }
  clear(): void { this.values.clear() }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null }
  get length(): number { return this.values.size }
}

test('WatchlistManager persists configuration and moves symbols between lists', () => {
  globalThis.localStorage = new MemoryStorage()
  const manager = WatchlistManager.getInstance()
  const first = manager.getLists()[0]
  const second = manager.createList('Momentum')

  manager.addSymbolFromInfo(first.id, {
    ticker: 'BINANCE:BTCUSDT',
    name: 'Bitcoin Perpetual / USDT',
    shortName: 'BTC PERP',
    exchange: 'BINANCE',
    pricePrecision: 2,
  })
  manager.moveSymbol(first.id, second.id, 'BINANCE:BTCUSDT')
  manager.setColor(second.id, '#26a69a')
  manager.setColumns(second.id, ['last', 'changePercent', 'volume'])
  manager.setSort(second.id, 'changePercent', 'desc')

  assert.equal(first.symbols.length, 0)
  assert.equal(second.symbols[0].exchange, 'BINANCE')
  assert.deepEqual(second.columns, ['last', 'changePercent', 'volume'])
  assert.deepEqual(second.sort, { column: 'changePercent', direction: 'desc' })
})

test('WatchlistManager emits live quotes without persisting them', () => {
  const manager = WatchlistManager.getInstance()
  const list = manager.getLists().find(item => item.name === 'Momentum')!
  let updates = 0
  const unsubscribe = manager.onChange(() => { updates += 1 })

  manager.updateQuotes([{
    ticker: 'BINANCE:BTCUSDT',
    last: asPrice(60500),
    changePercent: 2.5,
    volume: asVolume(1200),
  }])

  unsubscribe()
  assert.equal(list.symbols[0].lastPrice, 60500)
  assert.equal(updates, 1)
  const stored = JSON.parse(globalThis.localStorage.getItem('astroneum-watchlists') ?? '[]') as Array<{ symbols: Array<Record<string, unknown>> }>
  assert.equal('lastPrice' in stored[1].symbols[0], false)
  assert.equal('changePercent' in stored[1].symbols[0], false)
})
