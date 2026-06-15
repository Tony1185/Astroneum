import type { IndicatorTemplate } from '../../component/Indicator'

interface Vroc {
  vroc?: number
}

/**
 * VROC - Volume Rate of Change
 *
 * Measures the percentage change in volume over N periods.
 * VROC = (VOLUME - REF(VOLUME, N)) / REF(VOLUME, N) * 100
 */
const volumeRateOfChange: IndicatorTemplate<Vroc, number> = {
  name: 'VROC',
  shortName: 'VROC',
  calcParams: [14],
  precision: 2,
  figures: [
    { key: 'vroc', title: 'VROC: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    return dataList.map((candleData, i) => {
      const result: Vroc = {}
      if (i >= n) {
        const prevVolume = dataList[i - n].volume ?? 0
        const currentVolume = candleData.volume ?? 0
        if (prevVolume !== 0) {
          result.vroc = ((currentVolume - prevVolume) / prevVolume) * 100
        }
      }
      return result
    })
  }
}

export default volumeRateOfChange
