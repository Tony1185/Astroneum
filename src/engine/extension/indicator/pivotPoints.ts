import type { IndicatorTemplate } from '../../component/Indicator'

interface Pp {
  pp?: number
  r1?: number
  r2?: number
  r3?: number
  s1?: number
  s2?: number
  s3?: number
}

/**
 * PP - Pivot Points (Classic)
 *
 * Pivot Point   = (HIGH + LOW + CLOSE) / 3
 * Resistance 1  = 2 * PP - LOW
 * Resistance 2  = PP + (HIGH - LOW)
 * Resistance 3  = HIGH + 2 * (PP - LOW)
 * Support 1     = 2 * PP - HIGH
 * Support 2     = PP - (HIGH - LOW)
 * Support 3     = LOW - 2 * (HIGH - PP)
 *
 * Pivot points are calculated from the previous period's OHLC.
 * The first bar has no prior period, so it yields no values.
 */
const pivotPoints: IndicatorTemplate<Pp, number> = {
  name: 'PP',
  shortName: 'PP',
  series: 'price',
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'pp', title: 'PP: ', type: 'line' },
    { key: 'r1', title: 'R1: ', type: 'line' },
    { key: 'r2', title: 'R2: ', type: 'line' },
    { key: 'r3', title: 'R3: ', type: 'line' },
    { key: 's1', title: 'S1: ', type: 'line' },
    { key: 's2', title: 'S2: ', type: 'line' },
    { key: 's3', title: 'S3: ', type: 'line' }
  ],
  calc: (dataList) => {
    return dataList.map((candleData, i) => {
      const result: Pp = {}
      const prev = dataList[i - 1]
      if (prev) {
        const pp = (prev.high + prev.low + prev.close) / 3
        result.pp = pp
        result.r1 = 2 * pp - prev.low
        result.r2 = pp + (prev.high - prev.low)
        result.r3 = prev.high + 2 * (pp - prev.low)
        result.s1 = 2 * pp - prev.high
        result.s2 = pp - (prev.high - prev.low)
        result.s3 = prev.low - 2 * (prev.high - pp)
      }
      return result
    })
  }
}

export default pivotPoints
