import type { IndicatorTemplate } from '../../component/Indicator'

interface Atr {
  atr?: number
}

/**
 * ATR - Average True Range
 *
 * TR = MAX(HIGH - LOW, ABS(HIGH - REF(CLOSE, 1)), ABS(REF(CLOSE, 1) - LOW))
 * ATR = SMA(TR, N)
 */
const averageTrueRange: IndicatorTemplate<Atr, number> = {
  name: 'ATR',
  shortName: 'ATR',
  calcParams: [14],
  precision: 2,
  figures: [
    { key: 'atr', title: 'ATR: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    let trSum = 0
    let atr = 0
    return dataList.map((candleData, i) => {
      const atrResult: Atr = {}
      const prevClose = (dataList[i - 1] ?? candleData).close
      const high = candleData.high
      const low = candleData.low
      const hl = high - low
      const hc = Math.abs(high - prevClose)
      const lc = Math.abs(prevClose - low)
      const tr = Math.max(hl, hc, lc)

      trSum += tr
      if (i >= params[0] - 1) {
        if (i > params[0] - 1) {
          atr = (atr * (params[0] - 1) + tr) / params[0]
        } else {
          atr = trSum / params[0]
        }
        atrResult.atr = atr
      }
      return atrResult
    })
  }
}

export default averageTrueRange
