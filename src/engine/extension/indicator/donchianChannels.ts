import type { IndicatorTemplate } from '../../component/Indicator'

interface Dc {
  up?: number
  mid?: number
  dn?: number
}

/**
 * DC - Donchian Channels
 *
 * Upper Channel = Highest High over N periods
 * Middle Channel = (Highest High + Lowest Low) / 2
 * Lower Channel = Lowest Low over N periods
 *
 * Default period: 20
 */
const donchianChannels: IndicatorTemplate<Dc, number> = {
  name: 'DC',
  shortName: 'DC',
  series: 'price',
  calcParams: [20],
  precision: 2,
  shouldOhlc: true,
  figures: [
    { key: 'up', title: 'UP: ', type: 'line' },
    { key: 'mid', title: 'MID: ', type: 'line' },
    { key: 'dn', title: 'DN: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    return dataList.map((candleData, i) => {
      const dcResult: Dc = {}
      if (i >= n - 1) {
        let highMax = -Infinity
        let lowMin = Infinity
        for (let j = i - (n - 1); j <= i; j++) {
          highMax = Math.max(highMax, dataList[j].high)
          lowMin = Math.min(lowMin, dataList[j].low)
        }
        dcResult.up = highMax
        dcResult.dn = lowMin
        dcResult.mid = (highMax + lowMin) / 2
      }
      return dcResult
    })
  }
}

export default donchianChannels
