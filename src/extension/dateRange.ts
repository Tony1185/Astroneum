import type { OverlayTemplate } from '@/types'

const dateRange: OverlayTemplate = {
  name: 'dateRange',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, bounding, overlay }) => {
    if (coordinates.length < 2) return []
    const c0 = coordinates[0]
    const c1 = coordinates[1]
    const t0 = overlay.points[0]?.timestamp ?? 0
    const t1 = overlay.points[1]?.timestamp ?? 0
    const fmt = (t: number): string => {
      const d = new Date(t)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    const days = Math.abs(Math.round((t1 - t0) / 86400000))
    return [
      { type: 'line', attrs: [
        { coordinates: [{ x: c0.x, y: 0 }, { x: c0.x, y: bounding.height }] },
        { coordinates: [{ x: c1.x, y: 0 }, { x: c1.x, y: bounding.height }] },
        { coordinates: [{ x: c0.x, y: 16 }, { x: c1.x, y: 16 }] }
      ] },
      { type: 'text', ignoreEvent: true, attrs: [
        { x: c0.x + 4, y: 12, text: fmt(t0), baseline: 'bottom' },
        { x: c1.x + 4, y: 12, text: fmt(t1), baseline: 'bottom' },
        { x: (c0.x + c1.x) / 2, y: 28, text: `${days}d`, baseline: 'top' }
      ] }
    ]
  }
}

export default dateRange
