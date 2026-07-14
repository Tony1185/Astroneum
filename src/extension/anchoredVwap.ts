import type { OverlayTemplate } from '@/types'

const anchoredVwap: OverlayTemplate = {
  name: 'anchoredVwap',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, chart, xAxis, yAxis }) => {
    if (coordinates.length < 1 || !xAxis || !yAxis) return []
    const anchorIdx = overlay.points[0]?.dataIndex ?? 0
    const data = chart.getDataList()
    const endIdx = data.length - 1
    if (anchorIdx >= endIdx) return []
    let cumPV = 0
    let cumV = 0
    const vwapCoords: Array<{ x: number, y: number }> = []
    for (let i = anchorIdx; i <= endIdx && i < data.length; i++) {
      const candle = data[i]
      if (!candle) continue
      const typical = (candle.high + candle.low + candle.close) / 3
      const vol = candle.volume ?? 0
      cumPV += typical * vol
      cumV += vol
      if (cumV > 0) {
        const vwap = cumPV / cumV
        const x = xAxis.convertToPixel(i)
        const y = yAxis.convertToPixel(vwap)
        vwapCoords.push({ x, y })
      }
    }
    if (vwapCoords.length < 2) return []
    return [
      { type: 'line', attrs: { coordinates: vwapCoords }, styles: { style: 'solid', color: '#2962ff' } }
    ]
  }
}

export default anchoredVwap
