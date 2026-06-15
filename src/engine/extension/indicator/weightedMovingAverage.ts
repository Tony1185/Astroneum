import type { IndicatorTemplate } from '../../component/Indicator'

interface Wma {
  wma?: number
}

/**
 * WMA - Weighted Moving Average
 *
 * WMA = SUM(PRICE_i * WEIGHT_i) / SUM(WEIGHT_i)
 * Where weight_i = index + 1 (most recent has highest weight)
 */
const weightedMovingAverage: IndicatorTemplate<Wma, number> = {
  name: 'WMA',
  shortName: 'WMA',
  series: 'price',
  calcParams: [20],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'wma', title: 'WMA: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    const weightSum = n * (n + 1) / 2
    return dataList.map((candleData, i) => {
      const wmaResult: Wma = {}
      if (i >= n - 1) {
        let weightedSum = 0
        for (let j = 0; j < n; j++) {
          const weight = j + 1
          weightedSum += dataList[i - (n - 1) + j].close * weight
        }
        wmaResult.wma = weightedSum / weightSum
      }
      return wmaResult
    })
  }
}

export default weightedMovingAverage
