import type { IndicatorTemplate } from '../../component/Indicator'

interface Ama {
  ama?: number
}

/**
 * AMA - Adaptive Moving Average (Kaufman's Adaptive Moving Average / KAMA)
 *
 * Efficiency Ratio (ER) = SIGNAL / NOISE
 *   SIGNAL = ABS(CLOSE - REF(CLOSE, N - 1))
 *   NOISE  = SUM(ABS(CLOSE - REF(CLOSE, 1)), N - 1)
 * Smoothing Constant (SC) = [ER * (fastest - slowest) + slowest]²
 *   fastest = 2 / (2 + 1) = 0.6667
 *   slowest = 2 / (30 + 1) = 0.0645
 * AMA = REF(AMA, 1) + SC * (CLOSE - REF(AMA, 1))
 *
 * Default period: 10
 */
const adaptiveMovingAverage: IndicatorTemplate<Ama, number> = {
  name: 'AMA',
  shortName: 'AMA',
  series: 'price',
  calcParams: [10],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'ama', title: 'AMA: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    const fastest = 2 / (2 + 1)
    const slowest = 2 / (30 + 1)
    let ama = 0
    const result: Ama[] = []
    dataList.forEach((candleData, i) => {
      const resultItem: Ama = {}
      if (i >= n - 1) {
        const signal = Math.abs(candleData.close - dataList[i - (n - 1)].close)
        let noise = 0
        for (let j = i - (n - 2); j <= i; j++) {
          noise += Math.abs(dataList[j].close - dataList[j - 1].close)
        }
        const er = noise !== 0 ? signal / noise : 0
        const sc = (er * (fastest - slowest) + slowest) ** 2

        if (i === n - 1) {
          // Initialize AMA as SMA over first N periods
          let sum = 0
          for (let j = 0; j < n; j++) {
            sum += dataList[j].close
          }
          ama = sum / n
        } else {
          ama = ama + sc * (candleData.close - ama)
        }
        resultItem.ama = ama
      }
      result.push(resultItem)
    })
    return result
  }
}

export default adaptiveMovingAverage
