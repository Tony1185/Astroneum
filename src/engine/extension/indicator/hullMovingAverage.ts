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
 */
function wma(values: number[], period: number): number {
  if (values.length < period) return NaN
  let sum = 0
  let weightSum = 0
  const start = values.length - period
  for (let i = 0; i < period; i++) {
    const weight = i + 1
    sum += values[start + i] * weight
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
    dataList.forEach((candleData, i) => {
      const resultItem: Hma = {}
      // Need at least n bars to compute both WMAs and the final HMA
      const needed = n + sqrtN - 1
      if (i >= needed - 1) {
        const closes = dataList.slice(0, i + 1).map(d => d.close)
        // wma1 = WMA(close, n)
        const wma1 = wma(closes, n)
        // wma2 = WMA(close, n/2)
        const wma2 = wma(closes, halfN)
        // raw = 2 * wma2 - wma1
        const raw = 2 * wma2 - wma1
        // Collect raw values over sqrtN periods for final WMA
        closes.length = 0 // reuse
        for (let j = i - (sqrtN - 1); j <= i; j++) {
          const segmentCloses = dataList.slice(0, j + 1).map(d => d.close)
          const w1 = wma(segmentCloses, n)
          const w2 = wma(segmentCloses, halfN)
          closes.push(2 * w2 - w1)
        }
        resultItem.hma = wma(closes, sqrtN)
      }
      result.push(resultItem)
    })
    return result
  }
}

export default hullMovingAverage
