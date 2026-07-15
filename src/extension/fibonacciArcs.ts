import type { OverlayTemplate, TextAttrs } from '@/types'

import { getDistance } from './utils'

const fibonacciArcs: OverlayTemplate = {
  name: 'fibonacciArcs',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    if (coordinates.length <= 1) {
      return [{ type: 'line', attrs: { coordinates } }, { type: 'arc', attrs: [] }, { type: 'text', ignoreEvent: true, attrs: [] }]
    }
    const p0 = coordinates[0]
    const p1 = coordinates[1]
    const radius = getDistance(p0, p1)
    if (radius === 0) {
      return [{ type: 'arc', attrs: [] }, { type: 'text', ignoreEvent: true, attrs: [] }]
    }
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x)
    const percents = [0.236, 0.382, 0.5, 0.618, 0.786, 1]
    const arcs: Array<{ x: number; y: number; r: number; startAngle: number; endAngle: number }> = []
    const texts: TextAttrs[] = []
    percents.forEach(p => {
      const r = radius * p
      arcs.push({ x: p0.x, y: p0.y, r, startAngle: angle, endAngle: angle + Math.PI })
      texts.push({ x: p0.x + r * Math.cos(angle), y: p0.y + r * Math.sin(angle), text: `${(p * 100).toFixed(1)}%`, baseline: 'bottom' })
    })
    return [
      { type: 'line', attrs: { coordinates: [p0, p1] } },
      { type: 'arc', attrs: arcs },
      { type: 'text', ignoreEvent: true, attrs: texts }
    ]
  }
}

export default fibonacciArcs
