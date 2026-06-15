import type { IndicatorTemplate } from '../../component/Indicator'

interface Vwap {
  vwap?: number
}

/**
 * VWAP - Volume Weighted Average Price
 *
 * VWAP = SUM(PRICE_HL * VOLUME) / SUM(VOLUME)
 * Where PRICE_HL = (HIGH + LOW + CLOSE) / 3
 *
 * Typically reset daily for intraday charts. This implementation
 * computes a cumulative (non-resetting) VWAP which is standard for
 * daily/weekly timeframes and matches the TradingView "VWAP" anchor.
 */
const volumeWeightedAveragePrice: IndicatorTemplate<Vwap, number> = {
  name: 'VWAP',
  shortName: 'VWAP',
  series: 'price',
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'vwap', title: 'VWAP: ', type: 'line' }
  ],
  calc: (dataList) => {
    let cumTypicalVolume = 0
    let cumVolume = 0
    return dataList.map((candleData) => {
      const vwapResult: Vwap = {}
      const volume = candleData.volume ?? 0
      const typicalPrice = (candleData.high + candleData.low + candleData.close) / 3
      cumTypicalVolume += typicalPrice * volume
      cumVolume += volume
      if (cumVolume !== 0) {
        vwapResult.vwap = cumTypicalVolume / cumVolume
      }
      return vwapResult
    })
  }
}

export default volumeWeightedAveragePrice
