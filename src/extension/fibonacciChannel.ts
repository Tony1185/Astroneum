import type { OverlayTemplate, LineAttrs, TextAttrs } from '@/types'

import type { Coordinate } from '@/types'

const fibonacciChannel: OverlayTemplate = {
  name: 'fibonacciChannel',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length <= 1) {
      return [{ type: 'line', attrs: { coordinates } }, { type: 'line', attrs: [] }, { type: 'text', ignoreEvent: true, attrs: [] }]
    }
    if (coordinates.length <= 2) {
      return [
        { type: 'line', attrs: { coordinates: [coordinates[0], coordinates[1]] } },
        { type: 'line', attrs: [] },
        { type: 'text', ignoreEvent: true, attrs: [] }
      ]
    }
    const p0 = coordinates[0]
    const p1 = coordinates[1]
    const p2 = coordinates[2]
    const dx = p1.x - p0.x
    const dy = p1.y - p0.y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) {
      return [{ type: 'line', attrs: [] }, { type: 'text', ignoreEvent: true, attrs: [] }]
    }
    const perpX = -dy / len
    const perpY = dx / len
    const offsetDist = (p2.x - p0.x) * perpX + (p2.y - p0.y) * perpY
    const ox = perpX * offsetDist
    const oy = perpY * offsetDist
    const percents = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
    const lines: LineAttrs[] = []
    const texts: TextAttrs[] = []
    percents.forEach(p => {
      const start: Coordinate = { x: p0.x + ox * p, y: p0.y + oy * p }
      const end: Coordinate = { x: p1.x + ox * p, y: p1.y + oy * p }
      lines.push({ coordinates: [start, end] })
      texts.push({ x: start.x, y: start.y - 4, text: `${(p * 100).toFixed(1)}%`, baseline: 'bottom' })
    })
    return [
      { type: 'line', attrs: { coordinates: [p1, p2] }, styles: { style: 'dashed' } },
      { type: 'line', attrs: lines },
      { type: 'text', ignoreEvent: true, attrs: texts }
    ]
  }
}

export default fibonacciChannel
