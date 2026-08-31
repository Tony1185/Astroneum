import type { CandleData } from '../engine/common/Data'

export type Price = number & { readonly _brand: 'Price' }
export type Volume = number & { readonly _brand: 'Volume' }
export type Timestamp = number & { readonly _brand: 'Timestamp' }

export interface Viewport {
  priceMin: Price
  priceMax: Price
  timeMin: Timestamp
  timeMax: Timestamp
  resolution: readonly [width: number, height: number]
}

export interface IndicatorPlugin<TOutput> {
  name: string
  shortName?: string
  calcParams?: number[]
  calc(data: CandleData[], params: number[]): TOutput[]
  render2D?(ctx: CanvasRenderingContext2D, output: TOutput[], viewport: Viewport): void
  renderGL?(gl: WebGL2RenderingContext, output: TOutput[], viewport: Viewport, vbo: WebGLBuffer): void
}
