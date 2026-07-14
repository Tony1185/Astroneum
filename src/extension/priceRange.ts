import type { OverlayTemplate } from '@/types'

const priceRange: OverlayTemplate = {
  name: 'priceRange',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, bounding, overlay, chart }) => {
    if (coordinates.length < 2) return []
    const c0 = coordinates[0]
    const c1 = coordinates[1]
    const pp = chart.getSymbol()?.pricePrecision ?? 2
    const v0 = overlay.points[0]?.value ?? 0
    const v1 = overlay.points[1]?.value ?? 0
    const diff = Math.abs(v0 - v1).toFixed(pp)
    const pct = v0 !== 0 ? (Math.abs(v0 - v1) / v0 * 100).toFixed(2) : '0.00'
    return [
      { type: 'line', attrs: [
        { coordinates: [{ x: 0, y: c0.y }, { x: bounding.width, y: c0.y }] },
        { coordinates: [{ x: 0, y: c1.y }, { x: bounding.width, y: c1.y }] },
        { coordinates: [{ x: 20, y: c0.y }, { x: 20, y: c1.y }] }
      ] },
      { type: 'text', ignoreEvent: true, attrs: [
        { x: 24, y: c0.y, text: v0.toFixed(pp), baseline: 'bottom' },
        { x: 24, y: c1.y, text: v1.toFixed(pp), baseline: 'top' },
        { x: 24, y: (c0.y + c1.y) / 2, text: `${diff} (${pct}%)`, baseline: 'middle' }
      ] }
    ]
  }
}

export default priceRange
