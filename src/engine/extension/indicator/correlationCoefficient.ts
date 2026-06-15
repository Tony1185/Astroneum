import type { IndicatorTemplate } from '../../component/Indicator'

interface Corr {
  corr?: number
}

/**
 * CORR - Correlation Coefficient
 *
 * Measures the linear correlation between two data series over N periods.
 * CORR = Pearson's R between close prices and a linear sequence 1..N.
 * Values range from -1 (perfect negative) to +1 (perfect positive).
 */
const correlationCoefficient: IndicatorTemplate<Corr, number> = {
  name: 'CORR',
  shortName: 'CORR',
  calcParams: [20],
  precision: 4,
  figures: [
    { key: 'corr', title: 'CORR: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    return dataList.map((candleData, i) => {
      const result: Corr = {}
      if (i >= n - 1) {
        let sumX = 0
        let sumY = 0
        let sumXy = 0
        let sumX2 = 0
        let sumY2 = 0
        for (let j = 0; j < n; j++) {
          const x = j + 1
          const y = dataList[i - (n - 1) + j].close
          sumX += x
          sumY += y
          sumXy += x * y
          sumX2 += x * x
          sumY2 += y * y
        }
        const num = n * sumXy - sumX * sumY
        const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
        result.corr = den !== 0 ? num / den : 0
      }
      return result
    })
  }
}

export default correlationCoefficient
