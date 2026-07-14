import type { OverlayTemplate } from '@/types'

const sector: OverlayTemplate = {
  name: 'sector',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 3) return []
    const center = coordinates[0]
    const p1 = coordinates[1]
    const p2 = coordinates[2]
    const r = Math.sqrt((p1.x - center.x) ** 2 + (p1.y - center.y) ** 2)
    const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x)
    const endAngle = Math.atan2(p2.y - center.y, p2.x - center.x)
    return [
      { type: 'arc', attrs: { x: center.x, y: center.y, r, startAngle, endAngle }, styles: { style: 'stroke_fill', color: 'rgba(41, 98, 255, 0.1)' } },
      { type: 'line', attrs: { coordinates: [center, p1] } },
      { type: 'line', attrs: { coordinates: [center, p2] } }
    ]
  }
}

export default sector
