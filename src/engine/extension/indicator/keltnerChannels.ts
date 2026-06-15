import type { IndicatorTemplate } from '../../component/Indicator'

interface Kc {
  up?: number
  mid?: number
  dn?: number
}

/**
 * KC - Keltner Channels
 *
 * Middle Line = EMA(CLOSE, N)
 * True Range = MAX(HIGH - LOW, ABS(HIGH - REF(CLOSE, 1)), ABS(REF(CLOSE, 1) - LOW))
 * ATR = EMA(TR, N)
 * Upper Channel = Middle + Multiplier * ATR
 * Lower Channel = Middle - Multiplier * ATR
 *
 * Default params: [20, 1.5]
 */
const keltnerChannels: IndicatorTemplate<Kc, number> = {
  name: 'KC',
  shortName: 'KC',
  series: 'price',
  calcParams: [20, 1.5],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'up', title: 'UP: ', type: 'line' },
    { key: 'mid', title: 'MID: ', type: 'line' },
    { key: 'dn', title: 'DN: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    const multiplier = params[1]
    let closeSum = 0
    let ema = 0
    let trSum = 0
    let atr = 0
    return dataList.map((candleData, i) => {
      const kcResult: Kc = {}
      const close = candleData.close
      const prev = dataList[i - 1] ?? candleData
      const tr = Math.max(
        candleData.high - candleData.low,
        Math.abs(candleData.high - prev.close),
        Math.abs(prev.close - candleData.low)
      )
      closeSum += close
      trSum += tr
      if (i >= n - 1) {
        if (i > n - 1) {
          ema = (2 * close + (n - 1) * ema) / (n + 1)
          atr = (atr * (n - 1) + tr) / n
        } else {
          ema = closeSum / n
          atr = trSum / n
        }
        kcResult.mid = ema
        kcResult.up = ema + multiplier * atr
        kcResult.dn = ema - multiplier * atr
      }
      return kcResult
    })
  }
}

export default keltnerChannels
