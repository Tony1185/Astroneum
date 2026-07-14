import type { OverlayTemplate } from '@/types'

const dateAndPriceRange: OverlayTemplate = {
  name: 'dateAndPriceRange',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, chart }) => {
    if (coordinates.length < 2) return []
    const c0 = coordinates[0]
    const c1 = coordinates[1]
    const pp = chart.getSymbol()?.pricePrecision ?? 2
    const v0 = overlay.points[0]?.value ?? 0
    const v1 = overlay.points[1]?.value ?? 0
    const t0 = overlay.points[0]?.timestamp ?? 0
    const t1 = overlay.points[1]?.timestamp ?? 0
    const x = Math.min(c0.x, c1.x)
    const y = Math.min(c0.y, c1.y)
    const w = Math.abs(c1.x - c0.x)
    const h = Math.abs(c1.y - c0.y)
    const fmt = (t: number): string => {
      const d = new Date(t)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    const days = Math.abs(Math.round((t1 - t0) / 86400000))
    return [
      { type: 'rect', attrs: { x, y, width: w, height: h }, styles: { style: 'stroke_fill', color: 'rgba(41, 98, 255, 0.06)', borderColor: '#2962ff' }, ignoreEvent: true },
      { type: 'text', ignoreEvent: true, attrs: [
        { x: x + w + 4, y: y, text: Math.max(v0, v1).toFixed(pp), baseline: 'bottom' },
        { x: x + w + 4, y: y + h, text: Math.min(v0, v1).toFixed(pp), baseline: 'top' },
        { x: x, y: y + h + 4, text: fmt(Math.min(t0, t1)), baseline: 'top' },
        { x: x + w, y: y + h + 4, text: fmt(Math.max(t0, t1)), baseline: 'top' },
        { x: x + w / 2, y: y + h + 18, text: `${days}d`, baseline: 'top' }
      ] }
    ]
  }
}

export default dateAndPriceRange
