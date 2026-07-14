import type { OverlayTemplate } from '@/types'

const positionForecast: OverlayTemplate = {
  name: 'positionForecast',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length < 2) return []
    const c0 = coordinates[0]
    const c1 = coordinates[1]
    const dx = c1.x - c0.x
    const dy = c1.y - c0.y
    const projEnd = { x: c1.x + dx * 0.5, y: c1.y + dy * 0.5 }
    const coneSpread = Math.abs(dy) * 0.15 + 8
    const figures: Array<{ type: string, attrs: unknown, styles?: unknown, ignoreEvent?: boolean }> = [
      { type: 'line', attrs: { coordinates: [c0, c1] }, styles: { style: 'solid' } },
      { type: 'line', attrs: { coordinates: [c1, projEnd] }, styles: { style: 'dashed' } },
      { type: 'polygon', attrs: { coordinates: [c1, { x: projEnd.x, y: projEnd.y - coneSpread }, projEnd, { x: projEnd.x, y: projEnd.y + coneSpread }] }, styles: { style: 'fill', color: 'rgba(41, 98, 255, 0.08)' }, ignoreEvent: true }
    ]
    return figures
  }
}

export default positionForecast
