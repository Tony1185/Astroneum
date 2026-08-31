import builtInDrawingOverlays from '../extension'
import {
  dispose,
  getSupportedFigures,
  getSupportedIndicators,
  getSupportedLocales,
  getSupportedOverlays,
  init,
  registerBuiltInIndicators,
  registerBuiltInOverlays,
  registerFigure,
  registerIndicator,
  registerLocale,
  registerOverlay,
  registerStyles,
  registerXAxis,
  registerYAxis,
  version,
  type CandleData,
  type Chart,
} from '../engine'
import type { Options } from '../engine/Options'
import {
  createIndicatorTemplateFromPlugin,
  registerIndicatorPlugin,
  registerIndicatorPlugins,
} from '../plugin'

export type Price = number & { readonly _brand: 'Price' }
export type Volume = number & { readonly _brand: 'Volume' }
export type Timestamp = number & { readonly _brand: 'Timestamp' }

export const HEADLESS_CAPABILITIES = Object.freeze({
  manifestVersion: 1,
  lifecycle: 'idempotent-create-destroy',
  bars: 'strictly-ascending-utc-milliseconds',
  incrementalBars: 'replace-last-or-append',
  viewport: 'bounded-state-v1',
  coordinates: true,
  panes: true,
  studies: 'typed-plugin-output',
  drawings: 'host-registered-overlays',
  events: true,
  resize: true,
  screenshot: true,
  serverImport: true,
  nativeUi: false,
  bundledDatafeed: false,
  implicitNetwork: false,
  keyboardShortcuts: false,
})

export interface HeadlessBar extends Omit<CandleData, 'timestamp' | 'open' | 'high' | 'low' | 'close' | 'volume'> {
  timestamp: Timestamp
  open: Price
  high: Price
  low: Price
  close: Price
  volume?: Volume
}

export type HeadlessChart = Omit<Chart, 'getBars' | 'getDataList' | 'replaceBars' | 'updateBar'> & {
  getBars: () => readonly HeadlessBar[]
  replaceBars: (bars: readonly HeadlessBar[]) => void
  updateBar: (bar: HeadlessBar) => void
}

export type HeadlessChartOptions = Options

let drawingOverlaysRegistered = false

export function registerBuiltInExtensions (): void {
  registerBuiltInIndicators()
  registerBuiltInOverlays()
  if (!drawingOverlaysRegistered) {
    builtInDrawingOverlays.forEach(overlay => { registerOverlay(overlay) })
    drawingOverlaysRegistered = true
  }
}

export function createChart (container: HTMLElement, options?: HeadlessChartOptions): HeadlessChart {
  const chart = init(container, options)
  if (chart === null) {
    throw new Error('Astroneum could not create a chart for the supplied container')
  }
  return chart as unknown as HeadlessChart
}

export function destroyChart (target: HTMLElement | HeadlessChart): void {
  dispose(target as HTMLElement | Chart)
}

export function asPrice (value: number): Price {
  return value as Price
}

export function asVolume (value: number): Volume {
  return value as Volume
}

export function asTimestamp (value: number): Timestamp {
  return value as Timestamp
}

export {
  createIndicatorTemplateFromPlugin,
  getSupportedFigures,
  getSupportedIndicators,
  getSupportedLocales,
  getSupportedOverlays,
  registerFigure,
  registerIndicator,
  registerIndicatorPlugin,
  registerIndicatorPlugins,
  registerLocale,
  registerOverlay,
  registerStyles,
  registerXAxis,
  registerYAxis,
  version,
}

export type {
  ActionType,
  Bounding,
  Coordinate,
  DeepPartial,
  Indicator,
  IndicatorCreate,
  IndicatorFilter,
  OverlayCreate,
  OverlayFilter,
  OverlayTemplate,
  PaneOptions,
  Styles,
} from '../engine'

export type { IndicatorTemplate } from '../engine/component/Indicator'
export type { Period, PeriodType } from '../engine/common/Period'
export type { SymbolInfo } from '../engine/common/SymbolInfo'
export type { ChartViewportState } from '../engine/Chart'
export type { IndicatorPlugin, Viewport } from '../plugin/types'
