import type { OverlayTemplate } from '@/types'

const longPosition: OverlayTemplate = {
  name: 'longPosition',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, bounding, overlay, chart }) => {
    if (coordinates.length < 2) return []
    const entry = coordinates[0]
    const stop = coordinates[1]
    const target = coordinates.length > 2 ? coordinates[2] : undefined
    const pp = chart.getSymbol()?.pricePrecision ?? 2
    const lines: Array<{ coordinates: Array<{ x: number, y: number }> }> = [
      { coordinates: [{ x: 0, y: entry.y }, { x: bounding.width, y: entry.y }] },
      { coordinates: [{ x: 0, y: stop.y }, { x: bounding.width, y: stop.y }] }
    ]
    const texts: Array<{ x: number, y: number, text: string, baseline: string }> = [
      { x: 4, y: entry.y, text: `Entry ${(overlay.points[0]?.value ?? 0).toFixed(pp)}`, baseline: 'bottom' },
      { x: 4, y: stop.y, text: `Stop ${(overlay.points[1]?.value ?? 0).toFixed(pp)}`, baseline: 'top' }
    ]
    const figures: Array<{ type: string, attrs: unknown, styles?: unknown, ignoreEvent?: boolean }> = [
      { type: 'line', attrs: lines },
      { type: 'text', ignoreEvent: true, attrs: texts }
    ]
    const riskH = entry.y - stop.y
    if (riskH > 0) {
      figures.push({ type: 'rect', attrs: { x: 0, y: stop.y, width: bounding.width, height: riskH }, styles: { style: 'fill', color: 'rgba(239, 83, 80, 0.12)' }, ignoreEvent: true })
    }
    if (target) {
      lines.push({ coordinates: [{ x: 0, y: target.y }, { x: bounding.width, y: target.y }] })
      texts.push({ x: 4, y: target.y, text: `Target ${(overlay.points[2]?.value ?? 0).toFixed(pp)}`, baseline: 'bottom' })
      const rewardH = target.y - entry.y
      if (rewardH > 0) {
        figures.push({ type: 'rect', attrs: { x: 0, y: entry.y, width: bounding.width, height: rewardH }, styles: { style: 'fill', color: 'rgba(38, 166, 154, 0.12)' }, ignoreEvent: true })
        if (riskH > 0) {
          texts.push({ x: bounding.width - 80, y: entry.y - 4, text: `R:R ${(rewardH / riskH).toFixed(2)}`, baseline: 'bottom' })
        }
      }
    }
    return figures
  }
}

export default longPosition
