import type { IndicatorTemplate } from '../../component/Indicator'

/**
 * Ichimoku Cloud (一目均衡表)
 *
 * Tenkan-sen (Conversion Line)  = (9-period high + 9-period low) / 2
 * Kijun-sen   (Base Line)       = (26-period high + 26-period low) / 2
 * Senkou Span A (Leading Span A) = (Tenkan + Kijun) / 2, shifted 26 periods ahead
 * Senkou Span B (Leading Span B) = (52-period high + 52-period low) / 2, shifted 26 ahead
 * Chikou Span (Lagging Span)     = Close shifted 26 periods behind
 *
 * Default periods: 9, 26, 52
 */

interface Ichimoku {
  tenkan?: number
  kijun?: number
  senkouA?: number
  senkouB?: number
  chikou?: number
}

const ichimokuCloud: IndicatorTemplate<Ichimoku, number> = {
  name: 'Ichimoku',
  shortName: 'Ichimoku',
  series: 'price',
  calcParams: [9, 26, 52],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'tenkan', title: 'Tenkan: ', type: 'line' },
    { key: 'kijun', title: 'Kijun: ', type: 'line' },
    { key: 'senkouA', title: 'SenkouA: ', type: 'line' },
    { key: 'senkouB', title: 'SenkouB: ', type: 'line' },
    { key: 'chikou', title: 'Chikou: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const [tenkanPeriod, kijunPeriod, senkouBPeriod] = params
    const result: Ichimoku[] = []
    dataList.forEach((candleData, i) => {
      const ichi: Ichimoku = {}

      // Tenkan-sen: (highest high + lowest low) / 2 over tenkanPeriod
      if (i >= tenkanPeriod - 1) {
        let highMax = -Infinity
        let lowMin = Infinity
        for (let j = i - (tenkanPeriod - 1); j <= i; j++) {
          highMax = Math.max(highMax, dataList[j].high)
          lowMin = Math.min(lowMin, dataList[j].low)
        }
        ichi.tenkan = (highMax + lowMin) / 2
      }

      // Kijun-sen: (highest high + lowest low) / 2 over kijunPeriod
      if (i >= kijunPeriod - 1) {
        let highMax = -Infinity
        let lowMin = Infinity
        for (let j = i - (kijunPeriod - 1); j <= i; j++) {
          highMax = Math.max(highMax, dataList[j].high)
          lowMin = Math.min(lowMin, dataList[j].low)
        }
        ichi.kijun = (highMax + lowMin) / 2
      }

      // Senkou Span B: (highest high + lowest low) / 2 over senkouBPeriod
      if (i >= senkouBPeriod - 1) {
        let highMax = -Infinity
        let lowMin = Infinity
        for (let j = i - (senkouBPeriod - 1); j <= i; j++) {
          highMax = Math.max(highMax, dataList[j].high)
          lowMin = Math.min(lowMin, dataList[j].low)
        }
        ichi.senkouB = (highMax + lowMin) / 2
      }

      // Chikou Span: close shifted 26 periods behind
      if (i >= kijunPeriod - 1) {
        ichi.chikou = dataList[i - (kijunPeriod - 1)].close
      }

      result.push(ichi)
    })

    // Senkou Span A (shifted forward by kijunPeriod): (tenkan + kijun) / 2
    // Place at the index where both tenkan and kijun are available
    for (let i = 0; i < result.length; i++) {
      if (result[i].tenkan !== undefined && result[i].kijun !== undefined) {
        const sa = (result[i].tenkan! + result[i].kijun!) / 2
        const targetIdx = i + kijunPeriod
        if (targetIdx < result.length) {
          result[targetIdx].senkouA = sa
        } else {
          // Extend beyond available data — store at last position
          result[result.length - 1].senkouA = sa
        }
      }
    }

    return result
  }
}

export default ichimokuCloud
