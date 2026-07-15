import type { OverlayTemplate, LineAttrs, TextAttrs } from '@/types'

import { getRayLine } from './utils'

const fibonacciFan: OverlayTemplate = {
  name: 'fibonacciFan',
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
    const dx = p1.x - p0.x
    const dy = p1.y - p0.y
    const percents = [0, 0.382, 0.5, 0.618, 1, 1.618, 2.618]
    const lines: LineAttrs[] = []
    const texts: TextAttrs[] = []
    percents.forEach(p => {
      const secondPoint = { x: p0.x + dx, y: p0.y + dy * p }
      const ray = getRayLine([p0, secondPoint], bounding)
      if (Array.isArray(ray)) {
        lines.push(...ray)
      } else {
        lines.push(ray)
      }
      texts.push({ x: p0.x + 4, y: p0.y + dy * p + 2, text: `${p.toFixed(3)}`, baseline: 'top' })
    })
    return [
      { type: 'line', attrs: lines },
      { type: 'text', ignoreEvent: true, attrs: texts }
    ]
  }
}

export default fibonacciFan
