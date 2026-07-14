import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runBacktest } from '../strategy'
import type { CandleData } from '../types'
import ScriptEngine from '../scripting/ScriptEngine'

const bars: CandleData[] = [
  { timestamp: 1, open: 100, high: 101, low: 99, close: 100, volume: 1 },
  { timestamp: 2, open: 110, high: 111, low: 109, close: 110, volume: 1 },
  { timestamp: 3, open: 105, high: 106, low: 104, close: 105, volume: 1 },
]

describe('runBacktest', () => {
  it('uses deterministic bar-close fills and records metrics', () => {
    const result = runBacktest(bars, [
      { index: 0, action: 'enter', side: 'long' },
      { index: 1, action: 'exit' },
    ], { initialCapital: 1_000, commissionPercent: 0, positionSizePercent: 100 })

    assert.equal(result.mode, 'runtime')
    assert.equal(result.trades.length, 1)
    assert.equal(result.trades[0].netProfit, 100)
    assert.equal(result.metrics.netProfit, 100)
    assert.equal(result.equity.length, bars.length)
  })

  it('closes an open position at the final bar', () => {
    const result = runBacktest(bars, [{ index: 0, action: 'enter', side: 'short' }], {
      initialCapital: 1_000,
      commissionPercent: 0,
      positionSizePercent: 100,
    })

    assert.equal(result.trades.length, 1)
    assert.equal(result.trades[0].exitTime, 3)
    assert.ok(result.trades[0].netProfit < 0)
  })

  it('runs bounded strategy signals through the shared backtest core', () => {
    const strategy = ScriptEngine.getInstance().compileStrategy(`
      function strategySignals({ close }) {
        return [{ index: 0, action: 'enter', side: 'long' }, { index: close.length - 1, action: 'exit' }]
      }
    `)
    const result = strategy.run(bars, { commissionPercent: 0 })
    assert.equal(result.trades.length, 1)
  })
})
