import type { IndicatorTemplate } from '../../component/Indicator'

interface Dema {
  dema?: number
}

/**
 * DEMA - Double Exponential Moving Average
 *
 * EMA1 = EMA(CLOSE, N)
 * EMA2 = EMA(EMA1, N)
 * DEMA = 2 * EMA1 - EMA2
 */
const doubleExponentialMovingAverage: IndicatorTemplate<Dema, number> = {
  name: 'DEMA',
  shortName: 'DEMA',
  series: 'price',
  calcParams: [20],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'dema', title: 'DEMA: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    let closeSum = 0
    let ema1 = 0
    let ema2 = 0
    const result: Dema[] = []
    dataList.forEach((candleData, i) => {
      const demaResult: Dema = {}
      const close = candleData.close
      closeSum += close
      if (i >= n - 1) {
        if (i > n - 1) {
          const prevEma1 = ema1
          ema1 = (2 * close + (n - 1) * ema1) / (n + 1)
          ema2 = (2 * prevEma1 + (n - 1) * ema2) / (n + 1)
        } else {
          ema1 = closeSum / n
          ema2 = ema1
        }
        demaResult.dema = 2 * ema1 - ema2
      }
      result.push(demaResult)
    })
    return result
  }
}

export default doubleExponentialMovingAverage
