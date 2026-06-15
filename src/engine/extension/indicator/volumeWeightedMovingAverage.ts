import type { IndicatorTemplate } from '../../component/Indicator'

interface Vwma {
  vwma?: number
}

/**
 * VWMA - Volume Weighted Moving Average
 *
 * VWMA = SUM(CLOSE * VOLUME, N) / SUM(VOLUME, N)
 */
const volumeWeightedMovingAverage: IndicatorTemplate<Vwma, number> = {
  name: 'VWMA',
  shortName: 'VWMA',
  series: 'price',
  calcParams: [20],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'vwma', title: 'VWMA: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    let closeVolSum = 0
    let volSum = 0
    const result: Vwma[] = []
    dataList.forEach((candleData, i) => {
      const vwmaResult: Vwma = {}
      const volume = candleData.volume ?? 0
      closeVolSum += candleData.close * volume
      volSum += volume
      if (i >= n - 1) {
        if (volSum !== 0) {
          vwmaResult.vwma = closeVolSum / volSum
        }
        const removeData = dataList[i - (n - 1)]
        const removeVol = removeData.volume ?? 0
        closeVolSum -= removeData.close * removeVol
        volSum -= removeVol
      }
      result.push(vwmaResult)
    })
    return result
  }
}

export default volumeWeightedMovingAverage
