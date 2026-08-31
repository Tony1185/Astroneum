import assert from 'node:assert/strict'
import test from 'node:test'

import Store from '../engine/Store'
import type { Chart } from '../engine/Chart'
import type { CandleData } from '../engine/common/Data'

function createStore (): Store {
  const chart = {
    layout: () => {},
    updatePane: () => {},
  } as unknown as Chart
  return new Store(chart)
}

const bars: CandleData[] = [
  { timestamp: 1_000, open: 10, high: 13, low: 9, close: 12, volume: 100 },
  { timestamp: 2_000, open: 12, high: 15, low: 11, close: 14, volume: 120 },
]

test('replaceBars validates, copies, and atomically replaces data', () => {
  const store = createStore()
  const input = bars.map(bar => ({ ...bar }))
  store.replaceBars(input)

  assert.deepEqual(store.getDataList(), bars)
  assert.notEqual(store.getDataList(), input)
  assert.notEqual(store.getDataList()[0], input[0])

  input[0].close = 999
  assert.equal(store.getDataList()[0].close, 12)

  assert.throws(
    () => { store.replaceBars([bars[1], bars[0]]) },
    /strictly ascending/
  )
  assert.equal(store.getDataList().length, 2)
  assert.equal(store.getDataList()[0].close, 12)
  store.destroy()
})

test('replaceBars rejects invalid market data without repairing it', () => {
  const store = createStore()
  const invalidBars: CandleData[][] = [
    [{ timestamp: 1.5, open: 1, high: 2, low: 0, close: 1 }],
    [{ timestamp: 1, open: Number.NaN, high: 2, low: 0, close: 1 }],
    [{ timestamp: 1, open: 1, high: 0, low: 2, close: 1 }],
    [{ timestamp: 1, open: 1, high: 2, low: 0, close: 1, volume: -1 }],
  ]

  for (const invalid of invalidBars) {
    assert.throws(() => { store.replaceBars(invalid) })
    assert.equal(store.getDataList().length, 0)
  }
  store.destroy()
})

test('updateBar replaces the last bar or appends one and rejects older data', () => {
  const store = createStore()
  store.updateBar({ timestamp: 1_000, open: 10, high: 12, low: 9, close: 11, source: 'first' })
  store.updateBar({ timestamp: 1_000, open: 10, high: 14, low: 9, close: 13, source: 'replacement' })

  assert.equal(store.getDataList().length, 1)
  assert.equal(store.getDataList()[0].close, 13)
  assert.equal(store.getDataList()[0].source, 'replacement')

  store.updateBar({ timestamp: 2_000, open: 13, high: 15, low: 12, close: 14 })
  assert.equal(store.getDataList().length, 2)
  assert.throws(
    () => { store.updateBar({ timestamp: 1_500, open: 13, high: 15, low: 12, close: 14 }) },
    /must match or follow/
  )
  assert.equal(store.getDataList().length, 2)
  store.destroy()
})

test('direct bars unsubscribe and detach an explicitly configured loader', () => {
  const store = createStore()
  let loadCount = 0
  let unsubscribeCount = 0
  store.setSymbol({ ticker: 'TEST:BAR', pricePrecision: 2, volumePrecision: 0 })
  store.setPeriod({ multiplier: 1, timespan: 'minute', text: '1m' })
  store.setDataLoader({
    getBars: () => { loadCount++ },
    unsubscribeBar: () => { unsubscribeCount++ },
  })

  assert.equal(loadCount, 1)
  store.replaceBars(bars)
  store.updateBar({ timestamp: 3_000, open: 14, high: 16, low: 13, close: 15 })
  assert.equal(unsubscribeCount, 1)
  assert.equal(loadCount, 1)
  store.destroy()
})

test('direct bars ignore late history and realtime loader callbacks', () => {
  const store = createStore()
  let historyCallback: ((data: CandleData[]) => void) | undefined
  let realtimeCallback: ((data: CandleData) => void) | undefined
  store.setSymbol({ ticker: 'TEST:BAR', pricePrecision: 2, volumePrecision: 0 })
  store.setPeriod({ multiplier: 1, timespan: 'minute', text: '1m' })
  store.setDataLoader({
    getBars: params => { historyCallback = params.callback },
    subscribeBar: params => { realtimeCallback = params.callback },
  })

  historyCallback?.(bars)
  const directBars = [{ timestamp: 3_000, open: 20, high: 22, low: 19, close: 21 }]
  store.replaceBars(directBars)
  realtimeCallback?.({ timestamp: 4_000, open: 21, high: 23, low: 20, close: 22 })
  historyCallback?.(bars)

  assert.deepEqual(store.getDataList(), directBars)
  store.destroy()
})

test('destroy unsubscribes a configured loader and ignores a late response', () => {
  const store = createStore()
  let callback: ((data: CandleData[]) => void) | undefined
  let unsubscribeCount = 0
  store.setSymbol({ ticker: 'TEST:BAR', pricePrecision: 2, volumePrecision: 0 })
  store.setPeriod({ multiplier: 1, timespan: 'minute', text: '1m' })
  store.setDataLoader({
    getBars: params => { callback = params.callback },
    unsubscribeBar: () => { unsubscribeCount++ },
  })

  store.destroy()
  callback?.(bars)

  assert.equal(unsubscribeCount, 1)
  assert.deepEqual(store.getDataList(), [])
})
