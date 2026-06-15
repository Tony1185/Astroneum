import type { IndicatorTemplate } from '../../component/Indicator'

interface Ad {
  ad?: number
}

/**
 * A/D - Accumulation / Distribution Line
 *
 * CLV = ((CLOSE - LOW) - (HIGH - CLOSE)) / (HIGH - LOW)
 * AD = PREV_AD + CLV * VOLUME
 */
const accumulationDistribution: IndicatorTemplate<Ad, number> = {
  name: 'A/D',
  shortName: 'A/D',
  precision: 2,
  shouldFormatBigNumber: true,
  figures: [
    { key: 'ad', title: 'A/D: ', type: 'line' }
  ],
  calc: (dataList) => {
    let ad = 0
    return dataList.map((candleData) => {
      const adResult: Ad = {}
      const high = candleData.high
      const low = candleData.low
      const close = candleData.close
      const volume = candleData.volume ?? 0

      if (high !== low) {
        const clv = ((close - low) - (high - close)) / (high - low)
        ad += clv * volume
      }
      adResult.ad = ad
      return adResult
    })
  }
}

export default accumulationDistribution
