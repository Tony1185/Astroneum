import type { CandleData } from '@/engine'

export type StrategySide = 'long' | 'short'

export interface BacktestConfig {
  initialCapital: number
  commissionPercent: number
  slippagePercent: number
  positionSizePercent: number
  currency: string
}

export interface BacktestTrade {
  id: string
  side: StrategySide
  entryTime: number
  entryPrice: number
  exitTime: number
  exitPrice: number
  quantity: number
  grossProfit: number
  commission: number
  netProfit: number
  barsHeld: number
}

export interface EquityPoint {
  timestamp: number
  equity: number
  drawdownPercent: number
}

export interface BacktestMetrics {
  netProfit: number
  netProfitPercent: number
  grossProfit: number
  grossLoss: number
  profitFactor: number | null
  totalTrades: number
  percentProfitable: number
  maxDrawdown: number
  maxDrawdownPercent: number
  buyAndHoldPercent: number
}

export interface BacktestResult {
  config: BacktestConfig
  metrics: BacktestMetrics
  trades: BacktestTrade[]
  equity: EquityPoint[]
  bars: CandleData[]
  mode: 'fixture' | 'runtime'
}
