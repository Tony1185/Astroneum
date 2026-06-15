import type { IndicatorTemplate } from '../../component/Indicator'

interface Mfi {
  mfi?: number
}

/**
 * MFI - Money Flow Index
 *
 * TP = (HIGH + LOW + CLOSE) / 3
 * MF = TP * VOLUME
 * PMF = sum of MF when TP > REF(TP, 1)
 * NMF = sum of MF when TP < REF(TP, 1)
 * MFR = PMF / NMF
 * MFI = 100 - 100 / (1 + MFR)
 */
const moneyFlowIndex: IndicatorTemplate<Mfi, number> = {
  name: 'MFI',
  shortName: 'MFI',
  calcParams: [14],
  precision: 2,
  figures: [
    { key: 'mfi', title: 'MFI: ', type: 'line' }
  ],
  calc: (dataList, indicator) => {
    const params = indicator.calcParams
    const n = params[0]
    let pmfSum = 0
    let nmfSum = 0
    const result: Mfi[] = []
    dataList.forEach((candleData, i) => {
      const mfiResult: Mfi = {}
      const prev = dataList[i - 1] ?? candleData
      const tp = (candleData.high + candleData.low + candleData.close) / 3
      const prevTp = (prev.high + prev.low + prev.close) / 3
      const mf = tp * (candleData.volume ?? 0)

      if (tp > prevTp) {
        pmfSum += mf
      } else if (tp < prevTp) {
        nmfSum += mf
      }

      if (i >= n - 1) {
        if (nmfSum !== 0 && pmfSum + nmfSum !== 0) {
          const mfr = pmfSum / nmfSum
          mfiResult.mfi = 100 - 100 / (1 + mfr)
        } else if (pmfSum === 0 && nmfSum === 0) {
          mfiResult.mfi = 50
        } else if (pmfSum === 0) {
          mfiResult.mfi = 0
        } else {
          mfiResult.mfi = 100
        }

        // Remove the earliest tp's contribution
        const removeData = dataList[i - (n - 1)]
        const removePrev = dataList[i - n] ?? removeData
        const removeTp = (removeData.high + removeData.low + removeData.close) / 3
        const removePrevTp = (removePrev.high + removePrev.low + removePrev.close) / 3
        const removeMf = removeTp * (removeData.volume ?? 0)

        if (removeTp > removePrevTp) {
          pmfSum -= removeMf
        } else if (removeTp < removePrevTp) {
          nmfSum -= removeMf
        }
      }
      result.push(mfiResult)
    })
    return result
  }
}

export default moneyFlowIndex
