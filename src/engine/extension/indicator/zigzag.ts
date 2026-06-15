import type { IndicatorTemplate } from '../../component/Indicator'

interface Zigzag {
  zigzag?: number
}

/**
 * ZZ - ZigZag
 *
 * Plots lines connecting significant highs and lows.
 * A pivot high/low is identified when price reverses by at least
 * the deviation percentage (default 5%) from the previous pivot.
 *
 * The indicator filters out minor price movements, showing only
 * meaningful trend changes.
 *
 * Default params: [5] (5% minimum deviation)
 */
const zigzag: IndicatorTemplate<Zigzag, number> = {
  name: 'ZZ',
  shortName: 'ZZ',
  series: 'price',
  calcParams: [5],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'zigzag', title: 'ZZ: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const deviationPct = params[0] / 100
    const result: Zigzag[] = dataList.map(() => ({}))

    if (dataList.length < 3) return result

    // Find initial extreme
    let lastPivotIdx = 0
    let lastPivotVal = dataList[0].close
    let isUp = dataList[1].close > dataList[0].close

    for (let i = 2; i < dataList.length; i++) {
      if (isUp) {
        // Looking for a peak
        if (dataList[i].high > dataList[i - 1].high) {
          // Continue up — update potential peak
          continue
        }
        // Price dropped — check if it's a significant reversal
        const peakIdx = i - 1
        const peakVal = dataList[peakIdx].high
        const dropPct = (peakVal - dataList[i].low) / peakVal
        if (dropPct >= deviationPct) {
          // Mark the peak
          result[peakIdx].zigzag = peakVal
          lastPivotIdx = peakIdx
          lastPivotVal = peakVal
          isUp = false
        }
      } else {
        // Looking for a trough
        if (dataList[i].low < dataList[i - 1].low) {
          // Continue down — continue
          continue
        }
        // Price rose — check if it's a significant reversal
        const troughIdx = i - 1
        const troughVal = dataList[troughIdx].low
        const risePct = (dataList[i].high - troughVal) / troughVal
        if (risePct >= deviationPct) {
          // Mark the trough
          result[troughIdx].zigzag = troughVal
          lastPivotIdx = troughIdx
          lastPivotVal = troughVal
          isUp = true
        }
      }
    }

    return result
  }
}

export default zigzag
