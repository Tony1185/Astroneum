import type { IndicatorTemplate } from '../../component/Indicator'

interface LinReg {
  linreg?: number
  slope?: number
}

/**
 * LinReg - Linear Regression Line
 *
 * Fits a least-squares regression line to close prices over N periods.
 * The line value at the current bar is returned.
 *
 * y = slope * x + intercept
 * where x = N (most recent bar in the window)
 */
const linearRegression: IndicatorTemplate<LinReg, number> = {
  name: 'LinReg',
  shortName: 'LinReg',
  series: 'price',
  calcParams: [20],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'linreg', title: 'LinReg: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    return dataList.map((candleData, i) => {
      const result: LinReg = {}
      if (i >= n - 1) {
        let sumX = 0
        let sumY = 0
        let sumXy = 0
        let sumX2 = 0
        for (let j = 0; j < n; j++) {
          const x = j + 1
          const y = dataList[i - (n - 1) + j].close
          sumX += x
          sumY += y
          sumXy += x * y
          sumX2 += x * x
        }
        const slope = (n * sumXy - sumX * sumY) / (n * sumX2 - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n
        result.linreg = slope * n + intercept
        result.slope = slope
      }
      return result
    })
  }
}

export default linearRegression
