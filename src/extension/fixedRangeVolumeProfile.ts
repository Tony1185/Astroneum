import type { OverlayTemplate } from '@/types'

const fixedRangeVolumeProfile: OverlayTemplate = {
  name: 'fixedRangeVolumeProfile',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, bounding, overlay, chart, xAxis, yAxis }) => {
    if (coordinates.length < 2 || !xAxis || !yAxis) return []
    const startIdx = overlay.points[0]?.dataIndex ?? 0
    const endIdx = overlay.points[1]?.dataIndex ?? startIdx
    const data = chart.getDataList()
    const yTop = Math.min(coordinates[0].y, coordinates[1].y)
    const yBottom = Math.max(coordinates[0].y, coordinates[1].y)
    const bins = 24
    const binH = (yBottom - yTop) / bins
    const volumes: number[] = new Array(bins).fill(0)
    const sIdx = Math.min(startIdx, endIdx)
    const eIdx = Math.max(startIdx, endIdx)
    for (let i = sIdx; i <= eIdx && i < data.length; i++) {
      const candle = data[i]
      if (!candle) continue
      const vol = candle.volume ?? 0
      const yHigh = yAxis.convertToPixel(candle.high)
      const yLow = yAxis.convertToPixel(candle.low)
      const binStart = Math.max(0, Math.floor((yHigh - yTop) / binH))
      const binEnd = Math.min(bins - 1, Math.floor((yLow - yTop) / binH))
      for (let b = binStart; b <= binEnd; b++) {
        volumes[b] += vol
      }
    }
    const maxVol = Math.max(...volumes, 1)
    const maxBarW = bounding.width * 0.25
    const rects: Array<{ x: number, y: number, width: number, height: number }> = []
    for (let b = 0; b < bins; b++) {
      if (volumes[b] <= 0) continue
      const w = (volumes[b] / maxVol) * maxBarW
      rects.push({ x: bounding.width - w, y: yTop + b * binH, width: w, height: binH * 0.9 })
    }
    return [
      { type: 'rect', attrs: rects, styles: { style: 'fill', color: 'rgba(41, 98, 255, 0.4)' }, ignoreEvent: true }
    ]
  }
}

export default fixedRangeVolumeProfile
