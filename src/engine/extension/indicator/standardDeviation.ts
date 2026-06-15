import type { IndicatorTemplate } from '../../component/Indicator'

interface Stddev {
  stddev?: number
}

/**
 * STDDEV - Standard Deviation
 *
 * Calculates the population standard deviation of close prices over N periods.
 * σ = SQRT(SUM((CLOSE - SMA(CLOSE, N))², N) / N)
 */
const standardDeviation: IndicatorTemplate<Stddev, number> = {
  name: 'STDDEV',
  shortName: 'STDDEV',
  calcParams: [20],
  precision: 4,
  figures: [
    { key: 'stddev', title: 'STDDEV: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    return dataList.map((candleData, i) => {
      const result: Stddev = {}
      if (i >= n - 1) {
        let sum = 0
        for (let j = i - (n - 1); j <= i; j++) {
          sum += dataList[j].close
        }
        const mean = sum / n
        let sumSqDiff = 0
        for (let j = i - (n - 1); j <= i; j++) {
          sumSqDiff += (dataList[j].close - mean) ** 2
        }
        result.stddev = Math.sqrt(sumSqDiff / n)
      }
      return result
    })
  }
}

export default standardDeviation
