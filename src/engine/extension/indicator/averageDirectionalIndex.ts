import type { IndicatorTemplate } from '../../component/Indicator'

interface Adx {
  adx?: number
}

/**
 * ADX - Average Directional Index (standalone)
 *
 * Measures trend strength (not direction).
 * Values: 0-25 weak trend, 25-50 strong trend, 50-75 very strong, 75+ extremely strong.
 *
 * MTR  := EMA(MAX(HIGH-LOW, ABS(HIGH-REF(CLOSE,1)), ABS(REF(CLOSE,1)-LOW)), N)
 * HD   := HIGH - REF(HIGH, 1)
 * LD   := REF(LOW, 1) - LOW
 * DMP  := EMA(IF(HD>0 AND HD>LD, HD, 0), N)
 * DMM  := EMA(IF(LD>0 AND LD>HD, LD, 0), N)
 * PDI  := DMP * 100 / MTR
 * MDI  := DMM * 100 / MTR
 * DX   := ABS(MDI - PDI) / (MDI + PDI) * 100
 * ADX  := EMA(DX, N)
 */
const averageDirectionalIndex: IndicatorTemplate<Adx, number> = {
  name: 'ADX',
  shortName: 'ADX',
  calcParams: [14],
  precision: 2,
  figures: [
    { key: 'adx', title: 'ADX: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    let trSum = 0
    let hSum = 0
    let lSum = 0
    let mtr = 0
    let dmp = 0
    let dmm = 0
    let dxSum = 0
    let adx = 0
    return dataList.map((candleData, i) => {
      const adxResult: Adx = {}
      const prev = dataList[i - 1] ?? candleData
      const high = candleData.high
      const low = candleData.low
      const hl = high - low
      const hcy = Math.abs(high - prev.close)
      const lcy = Math.abs(prev.close - low)
      const hhy = high - prev.high
      const lyl = prev.low - low
      const tr = Math.max(hl, hcy, lcy)
      const h = (hhy > 0 && hhy > lyl) ? hhy : 0
      const l = (lyl > 0 && lyl > hhy) ? lyl : 0
      trSum += tr
      hSum += h
      lSum += l
      if (i >= n - 1) {
        if (i > n - 1) {
          mtr = mtr - mtr / n + tr
          dmp = dmp - dmp / n + h
          dmm = dmm - dmm / n + l
        } else {
          mtr = trSum
          dmp = hSum
          dmm = lSum
        }
        let pdi = 0
        let mdi = 0
        if (mtr !== 0) {
          pdi = dmp * 100 / mtr
          mdi = dmm * 100 / mtr
        }
        let dx = 0
        if (mdi + pdi !== 0) {
          dx = Math.abs(mdi - pdi) / (mdi + pdi) * 100
        }
        dxSum += dx
        if (i >= n * 2 - 2) {
          if (i > n * 2 - 2) {
            adx = (adx * (n - 1) + dx) / n
          } else {
            adx = dxSum / n
          }
          adxResult.adx = adx
        }
      }
      return adxResult
    })
  }
}

export default averageDirectionalIndex
