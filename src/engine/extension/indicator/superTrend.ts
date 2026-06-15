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
    let prevSuperTrend = 0
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
          // First bar with ATR — initialize direction based on close
          direction = candleData.close > (hl2) ? 1 : -1
        }

        let superTrendVal
        if (direction === 1) {
          // Uptrend: supertrend follows lower band
          superTrendVal = lowerBand
          // Flip to downtrend if close crosses below previous supertrend
          if (candleData.close <= prevSuperTrend) {
            direction = -1
            superTrendVal = upperBand
          }
        } else {
          // Downtrend: supertrend follows upper band
          superTrendVal = upperBand
          // Flip to uptrend if close crosses above previous supertrend
          if (candleData.close >= prevSuperTrend) {
            direction = 1
            superTrendVal = lowerBand
          }
        }

        stResult.superTrend = superTrendVal
        stResult.direction = direction
        prevSuperTrend = superTrendVal
      }
      result.push(stResult)
    })
    return result
  }
}

export default superTrend
