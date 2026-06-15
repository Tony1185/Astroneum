import type { IndicatorTemplate } from '../../component/Indicator'

interface Tema {
  tema?: number
}

/**
 * TEMA - Triple Exponential Moving Average
 *
 * EMA1 = EMA(CLOSE, N)
 * EMA2 = EMA(EMA1, N)
 * EMA3 = EMA(EMA2, N)
 * TEMA = 3 * EMA1 - 3 * EMA2 + EMA3
 */
const tripleExponentialMovingAverage: IndicatorTemplate<Tema, number> = {
  name: 'TEMA',
  shortName: 'TEMA',
  series: 'price',
  calcParams: [20],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'tema', title: 'TEMA: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    let closeSum = 0
    let ema1 = 0
    let ema2 = 0
    let ema3 = 0
    const result: Tema[] = []
    dataList.forEach((candleData, i) => {
      const temaResult: Tema = {}
      const close = candleData.close
      closeSum += close
      if (i >= n - 1) {
        if (i > n - 1) {
          const prevEma1 = ema1
          const prevEma2 = ema2
          ema1 = (2 * close + (n - 1) * ema1) / (n + 1)
          ema2 = (2 * prevEma1 + (n - 1) * ema2) / (n + 1)
          ema3 = (2 * prevEma2 + (n - 1) * ema3) / (n + 1)
        } else {
          ema1 = closeSum / n
          ema2 = ema1
          ema3 = ema1
        }
        temaResult.tema = 3 * ema1 - 3 * ema2 + ema3
      }
      result.push(temaResult)
    })
    return result
  }
}

export default tripleExponentialMovingAverage
