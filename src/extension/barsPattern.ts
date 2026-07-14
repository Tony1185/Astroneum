import type { OverlayTemplate } from '@/types'

const barsPattern: OverlayTemplate = {
  name: 'barsPattern',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, chart, xAxis, yAxis }) => {
    if (coordinates.length < 3 || !xAxis || !yAxis) return []
    const srcStart = overlay.points[0]?.dataIndex ?? 0
    const srcEnd = overlay.points[1]?.dataIndex ?? srcStart
    const destX = coordinates[2].x
    const data = chart.getDataList()
    const startIdx = Math.min(srcStart, srcEnd)
    const endIdx = Math.max(srcStart, srcEnd)
    const candleWidth = Math.max(2, Math.abs(xAxis.convertToPixel(1) - xAxis.convertToPixel(0)) * 0.6)
    const lines: Array<{ coordinates: Array<{ x: number, y: number }> }> = []
    const rects: Array<{ x: number, y: number, width: number, height: number }> = []
    for (let i = startIdx; i <= endIdx && i < data.length; i++) {
      const candle = data[i]
      if (!candle) continue
      const offsetX = destX + (i - startIdx) * candleWidth
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
    if (lines.length) figures.push({ type: 'line', attrs: lines, styles: { color: 'rgba(120, 120, 120, 0.6)' } })
    if (rects.length) figures.push({ type: 'rect', attrs: rects, styles: { style: 'stroke_fill', color: 'rgba(120, 120, 120, 0.3)', borderColor: 'rgba(120, 120, 120, 0.6)' }, ignoreEvent: true })
    return figures
  }
}

export default barsPattern
