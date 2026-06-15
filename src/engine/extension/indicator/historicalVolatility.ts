import type { IndicatorTemplate } from '../../component/Indicator'

interface Hv {
  hv?: number
}

/**
 * HV - Historical Volatility
 *
 * Annualized volatility calculated from log returns.
 *
 * R_i = LN(CLOSE_i / CLOSE_{i-1})
 * HV = STDEV(R, N) * SQRT(252)
 *
 * The result is expressed as annualized volatility (e.g., 0.25 = 25%).
 */
const historicalVolatility: IndicatorTemplate<Hv, number> = {
  name: 'HV',
  shortName: 'HV',
  calcParams: [20],
  precision: 4,
  figures: [
    { key: 'hv', title: 'HV: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    const result: Hv[] = []
    const logReturns: number[] = []
    dataList.forEach((candleData, i) => {
      const hvResult: Hv = {}
      const prev = dataList[i - 1]
      if (prev && prev.close !== 0) {
        logReturns.push(Math.log(candleData.close / prev.close))
      } else {
        logReturns.push(0)
      }

      if (i >= n) {
        const returns = logReturns.slice(i - n + 1, i + 1)
        const mean = returns.reduce((s, r) => s + r, 0) / n
        let sumSqDiff = 0
        for (let j = 0; j < returns.length; j++) {
          sumSqDiff += (returns[j] - mean) ** 2
        }
        const stdDev = Math.sqrt(sumSqDiff / (n - 1))
        hvResult.hv = stdDev * Math.sqrt(252)
      }
      result.push(hvResult)
    })
    return result
  }
}

export default historicalVolatility
