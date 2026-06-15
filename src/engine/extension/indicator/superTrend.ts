import type { IndicatorTemplate } from '../../component/Indicator'

interface SuperTrend {
  superTrend?: number
  direction?: number
}

/**
 * SuperTrend
 *
 * Combines trend direction and volatility-based trailing stops.
 *
 * ATR = ATR(N)
 * Upper Band = (HIGH + LOW) / 2 + Multiplier * ATR
 * Lower Band = (HIGH + LOW) / 2 - Multiplier * ATR
 *
 * SuperTrend follows the lower band in uptrends and the upper band
 * in downtrends. When price crosses the supertrend line, the trend
 * reverses.
 *
 * direction = 1 (uptrend), direction = -1 (downtrend)
 *
 * Default params: [10, 3]
 */
const superTrend: IndicatorTemplate<SuperTrend, number> = {
  name: 'SuperTrend',
  shortName: 'SuperTrend',
  series: 'price',
  calcParams: [10, 3],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'superTrend', title: 'SuperTrend: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    const multiplier = params[1]

    let trSum = 0
    let atr = 0
    let direction = 1
    let finalUpper = 0
    let finalLower = 0
    const result: SuperTrend[] = []

    dataList.forEach((candleData, i) => {
      const stResult: SuperTrend = {}
      const hl2 = (candleData.high + candleData.low) / 2
      const prev = dataList[i - 1] ?? candleData
      const tr = Math.max(
        candleData.high - candleData.low,
        Math.abs(candleData.high - prev.close),
        Math.abs(prev.close - candleData.low)
      )
      trSum += tr

      if (i >= n - 1) {
        if (i > n - 1) {
          atr = (atr * (n - 1) + tr) / n
        } else {
          atr = trSum / n
        }

        const upperBand = hl2 + multiplier * atr
        const lowerBand = hl2 - multiplier * atr

        if (i === n - 1) {
          finalUpper = upperBand
          finalLower = lowerBand
          direction = 1
        } else {
          // Ratchet bands: only tighten in the direction of the trend
          finalUpper = (upperBand < finalUpper || prev.close > finalUpper) ? upperBand : finalUpper
          finalLower = (lowerBand > finalLower || prev.close < finalLower) ? lowerBand : finalLower

          if (direction === 1 && candleData.close < finalLower) {
            direction = -1
          } else if (direction === -1 && candleData.close > finalUpper) {
            direction = 1
          }
        }

        stResult.superTrend = direction === 1 ? finalLower : finalUpper
        stResult.direction = direction
      }
      result.push(stResult)
    })
    return result
  }
}

export default superTrend
