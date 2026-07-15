import type { OverlayTemplate, LineAttrs, TextAttrs } from '@/types'

const fibonacciTimeZones: OverlayTemplate = {
  name: 'fibonacciTimeZones',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, bounding }) => {
    if (coordinates.length <= 1) {
      return [{ type: 'line', attrs: { coordinates } }, { type: 'line', attrs: [] }, { type: 'text', ignoreEvent: true, attrs: [] }]
    }
    const p0 = coordinates[0]
    const p1 = coordinates[1]
    const unit = p1.x - p0.x
    if (unit === 0) {
      return [{ type: 'line', attrs: [] }, { type: 'text', ignoreEvent: true, attrs: [] }]
    }
    const fibNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    const lines: LineAttrs[] = []
    const texts: TextAttrs[] = []
    fibNumbers.forEach(n => {
      const x = p0.x + unit * n
      lines.push({ coordinates: [{ x, y: 0 }, { x, y: bounding.height }] })
      texts.push({ x: x + 2, y: 14, text: `${n}`, baseline: 'top' })
    })
    lines.push({ coordinates: [{ x: p0.x, y: 0 }, { x: p0.x, y: bounding.height }] })
    return [
      { type: 'line', attrs: lines },
      { type: 'text', ignoreEvent: true, attrs: texts }
    ]
  }
}

export default fibonacciTimeZones
