import type { IndicatorTemplate } from '../../component/Indicator'

interface Cmf {
  cmf?: number
}

/**
 * CMF - Chaikin Money Flow
 *
 * AD = ((CLOSE - LOW) - (HIGH - CLOSE)) / (HIGH - LOW)
 * CMF = SUM(AD * VOLUME, N) / SUM(VOLUME, N)
 */
const chaikinMoneyFlow: IndicatorTemplate<Cmf, number> = {
  name: 'CMF',
  shortName: 'CMF',
  calcParams: [20],
  precision: 4,
  figures: [
    { key: 'cmf', title: 'CMF: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    let adVolumeSum = 0
    let volumeSum = 0
    const result: Cmf[] = []
    dataList.forEach((candleData, i) => {
      const cmfResult: Cmf = {}
      const high = candleData.high
      const low = candleData.low
      const close = candleData.close
      const volume = candleData.volume ?? 0

      let ad = 0
      if (high !== low) {
        ad = ((close - low) - (high - close)) / (high - low)
      }

      adVolumeSum += ad * volume
      volumeSum += volume
      if (i >= n - 1) {
        if (volumeSum !== 0) {
          cmfResult.cmf = adVolumeSum / volumeSum
        }
        const prevData = dataList[i - (n - 1)]
        const prevVolume = prevData.volume ?? 0
        let prevAd = 0
        if (prevData.high !== prevData.low) {
          prevAd = ((prevData.close - prevData.low) - (prevData.high - prevData.close)) / (prevData.high - prevData.low)
        }
        adVolumeSum -= prevAd * prevVolume
        volumeSum -= prevVolume
      }
      result.push(cmfResult)
    })
    return result
  }
}

export default chaikinMoneyFlow
