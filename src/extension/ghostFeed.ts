import type { OverlayTemplate } from '@/types'

const ghostFeed: OverlayTemplate = {
  name: 'ghostFeed',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, chart, xAxis, yAxis }) => {
    if (coordinates.length < 2 || !xAxis || !yAxis) return []
    const anchorIdx = overlay.points[0]?.dataIndex ?? 0
    const shiftX = coordinates[1].x - coordinates[0].x
    const data = chart.getDataList()
    const candleWidth = Math.max(2, Math.abs(xAxis.convertToPixel(1) - xAxis.convertToPixel(0)) * 0.6)
    const count = Math.min(50, anchorIdx + 1)
    const lines: Array<{ coordinates: Array<{ x: number, y: number }> }> = []
    const rects: Array<{ x: number, y: number, width: number, height: number }> = []
    for (let i = 0; i < count; i++) {
      const dataIdx = anchorIdx - count + 1 + i
      if (dataIdx < 0 || dataIdx >= data.length) continue
      const candle = data[dataIdx]
      if (!candle) continue
      const baseX = xAxis.convertToPixel(dataIdx)
      const offsetX = baseX + shiftX
      const yOpen = yAxis.convertToPixel(candle.open)
      const yClose = yAxis.convertToPixel(candle.close)
      const yHigh = yAxis.convertToPixel(candle.high)
      const yLow = yAxis.convertToPixel(candle.low)
      lines.push({ coordinates: [{ x: offsetX, y: yHigh }, { x: offsetX, y: yLow }] })
      const bodyTop = Math.min(yOpen, yClose)
      const bodyH = Math.max(1, Math.abs(yClose - yOpen))
      rects.push({ x: offsetX - candleWidth / 2, y: bodyTop, width: candleWidth, height: bodyH })
    }
    const figures: Array<{ type: string, attrs: unknown, styles?: unknown, ignoreEvent?: boolean }> = []
    if (lines.length) figures.push({ type: 'line', attrs: lines, styles: { color: 'rgba(100, 149, 237, 0.5)' } })
    if (rects.length) figures.push({ type: 'rect', attrs: rects, styles: { style: 'stroke_fill', color: 'rgba(100, 149, 237, 0.2)', borderColor: 'rgba(100, 149, 237, 0.5)' }, ignoreEvent: true })
    return figures
  }
}

export default ghostFeed
