import type { IndicatorTemplate } from '../../component/Indicator'

interface Hma {
  hma?: number
}

/**
 * HMA - Hull Moving Average
 *
 * HMA = WMA(2 * WMA(CLOSE, N/2) - WMA(CLOSE, N), SQRT(N))
 *
 * Reduces lag of traditional moving averages by using weighted
 * calculations of the difference of two WMAs.
 *
 * Implementation uses a running WMA helper for O(n²) total complexity.
 */

function wma(closes: number[], period: number): number {
  if (closes.length < period) return NaN
  let sum = 0
  let weightSum = 0
  const start = closes.length - period
  for (let i = 0; i < period; i++) {
    const weight = i + 1
    sum += closes[start + i] * weight
    weightSum += weight
  }
  return sum / weightSum
}

const hullMovingAverage: IndicatorTemplate<Hma, number> = {
  name: 'HMA',
  shortName: 'HMA',
  series: 'price',
  calcParams: [20],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'hma', title: 'HMA: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    const halfN = Math.max(Math.floor(n / 2), 1)
    const sqrtN = Math.max(Math.round(Math.sqrt(n)), 1)
    const result: Hma[] = []

    // Precompute all raw = 2*WMA(close, n/2) - WMA(close, n) values first
    const rawValues: number[] = []
    for (let i = 0; i < dataList.length; i++) {
      const closes = dataList.slice(0, i + 1).map(d => d.close)
      if (closes.length >= n) {
        const w1 = wma(closes, n)
        const w2 = wma(closes, halfN)
        rawValues.push(2 * w2 - w1)
      } else {
        rawValues.push(NaN)
      }
    }

    // Now compute WMA of raw values over sqrtN periods
    for (let i = 0; i < dataList.length; i++) {
      const resultItem: Hma = {}
      if (i >= n + sqrtN - 2) {
        const rawWindow = rawValues.slice(i - (sqrtN - 1), i + 1)
        resultItem.hma = wma(rawWindow, sqrtN)
      }
      result.push(resultItem)
    }
    return result
  }
}

export default hullMovingAverage
