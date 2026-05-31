import test from 'node:test'
import assert from 'node:assert/strict'

import {
  STANDARD_CRYPTO_SYMBOLS,
  DATAFEED_ERROR_EVENT,
  createStandardCryptoDatafeed,
} from '../datafeed/StandardCryptoDatafeed'
import type { Datafeed, SymbolInfo, Period, CandleData } from '../types'

/**
 * Datafeed contract tests — confirm anything we ship as a Datafeed honours
 * the documented interface even before it talks to the network. These tests
 * are deliberately offline; they assert shape + behaviour, not transport.
 */

test('STANDARD_CRYPTO_SYMBOLS is a non-empty list of well-formed symbols', () => {
  assert.ok(Array.isArray(STANDARD_CRYPTO_SYMBOLS))
  assert.ok(STANDARD_CRYPTO_SYMBOLS.length > 0)
  for (const s of STANDARD_CRYPTO_SYMBOLS) {
    assert.equal(typeof s.ticker, 'string', `ticker on ${JSON.stringify(s)}`)
    assert.equal(typeof s.exchange, 'string', `exchange on ${s.ticker}`)
    assert.equal(typeof s.pricePrecision, 'number', `pricePrecision on ${s.ticker}`)
    assert.ok(s.ticker.includes(':'), `ticker should be EXCHANGE:PAIR, got ${s.ticker}`)
  }
})

test('DATAFEED_ERROR_EVENT is a non-empty event name', () => {
  assert.equal(typeof DATAFEED_ERROR_EVENT, 'string')
  assert.ok(DATAFEED_ERROR_EVENT.length > 0)
})

test('createStandardCryptoDatafeed returns the documented Datafeed shape', () => {
  const df = createStandardCryptoDatafeed({ smoothingDuration: 320 })
  assert.equal(typeof df.searchSymbols, 'function')
  assert.equal(typeof df.getHistoryData, 'function')
  assert.equal(typeof df.subscribe, 'function')
  assert.equal(typeof df.unsubscribe, 'function')
})

test('a minimal custom Datafeed satisfies the type contract', async () => {
  const bars: CandleData[] = [
    { timestamp: 1, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 },
    { timestamp: 2, open: 1.5, high: 2.5, low: 1, close: 2, volume: 12 },
  ]
  const symbol: SymbolInfo = {
    ticker: 'TEST:BAR',
    name: 'Test',
    shortName: 'TEST',
    exchange: 'TEST',
    market: 'crypto',
    pricePrecision: 2,
    volumePrecision: 2,
    priceCurrency: 'USDT',
    type: 'crypto',
  }
  const period: Period = { multiplier: 1, timespan: 'minute', text: '1m' }

  const calls: string[] = []
  const df: Datafeed = {
    async searchSymbols () { calls.push('search'); return [symbol] },
    async getHistoryData (s, p) {
      calls.push('history')
      assert.equal(s.ticker, symbol.ticker)
      assert.equal(p.text, period.text)
      return bars
    },
    subscribe () { calls.push('subscribe') },
    unsubscribe () { calls.push('unsubscribe') },
  }

  const found = await df.searchSymbols('TEST')
  assert.equal(found.length, 1)
  const hist = await df.getHistoryData(symbol, period, 0, 100)
  assert.equal(hist.length, 2)
  df.subscribe(symbol, period, () => {})
  df.unsubscribe(symbol, period)
  assert.deepEqual(calls, ['search', 'history', 'subscribe', 'unsubscribe'])
})
