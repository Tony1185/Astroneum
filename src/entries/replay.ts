/**
 * Subpath entry: `astroneum/replay`
 *
 * Lets consumers import the bar-replay controller without dragging in the
 * rest of the chart surface when they only need replay logic
 * (e.g. headless backtests, server-side replay).
 */
export { default as BarReplay } from '../chart/BarReplay'
export type { BarReplayOptions, BarReplayState } from '../chart/BarReplay'
