import type { OverlayTemplate, LineAttrs, TextAttrs } from '@/types'

const fibonacciWedge: OverlayTemplate = {
  name: 'fibonacciWedge',
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
    const percents = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
    const lines: LineAttrs[] = []
    const texts: TextAttrs[] = []
    percents.forEach(p => {
      const start = { x: p0.x + (p1.x - p0.x) * p, y: p0.y + (p1.y - p0.y) * p }
      const end = { x: p0.x + (p2.x - p0.x) * p, y: p0.y + (p2.y - p0.y) * p }
      lines.push({ coordinates: [start, end] })
      texts.push({ x: start.x - 4, y: start.y, text: `${(p * 100).toFixed(1)}%`, baseline: 'bottom' })
    })
    lines.push({ coordinates: [p0, p1] })
    lines.push({ coordinates: [p0, p2] })
    return [
      { type: 'line', attrs: lines },
      { type: 'text', ignoreEvent: true, attrs: texts }
    ]
  }
}

export default fibonacciWedge
