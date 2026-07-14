import type { IndicatorTemplate } from '../../component/Indicator'

interface SampleStudy {
  value?: number
}

/**
 * Sample Study
 * A simple oscillator 0-100 demonstrating indicator-based alerts.
 * Uses a normalized RSI-like formula with a single period parameter.
 * The "value" plot is the alertable series.
 */
const sampleStudy: IndicatorTemplate<SampleStudy, number> = {
  name: 'SAMPLE',
  shortName: 'Sample Study',
  calcParams: [14],
  figures: [
    { key: 'value', title: 'Value: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const period = indicator.calcParams[0] ?? 14
    let avgGain = 0
    let avgLoss = 0
    return dataList.map((candle, i) => {
      const result: SampleStudy = {}
      if (i === 0) {
        result.value = 50
        return result
      }
      const change = candle.close - dataList[i - 1].close
      const gain = Math.max(change, 0)
      const loss = Math.max(-change, 0)
      if (i <= period) {
        avgGain = (avgGain * (i - 1) + gain) / i
        avgLoss = (avgLoss * (i - 1) + loss) / i
      } else {
        avgGain = (avgGain * (period - 1) + gain) / period
        avgLoss = (avgLoss * (period - 1) + loss) / period
      }
      if (avgLoss === 0) {
        result.value = 100
      } else {
        const rs = avgGain / avgLoss
        result.value = 100 - (100 / (1 + rs))
      }
      return result
    })
  }
}

export default sampleStudy
