import type { CandleData } from '@/types'
import type { BacktestConfig, BacktestMetrics, BacktestResult, BacktestTrade, EquityPoint, StrategySide } from './types'

export interface StrategySignal {
  index: number
  action: 'enter' | 'exit'
  side?: StrategySide
}

const DEFAULT_CONFIG: BacktestConfig = {
  initialCapital: 10_000,
  commissionPercent: 0.1,
  slippagePercent: 0,
  positionSizePercent: 100,
  currency: 'USD',
}

interface OpenPosition {
  side: StrategySide
  entryIndex: number
  entryPrice: number
  quantity: number
  entryCommission: number
}

function fillPrice(price: number, side: StrategySide, entering: boolean, slippagePercent: number): number {
  const direction = (side === 'long') === entering ? 1 : -1
  return price * (1 + direction * (slippagePercent / 100))
}

function metrics(trades: BacktestTrade[], initialCapital: number, equity: EquityPoint[], bars: CandleData[]): BacktestMetrics {
  const grossProfit = trades.filter(trade => trade.grossProfit > 0).reduce((sum, trade) => sum + trade.grossProfit, 0)
  const grossLoss = trades.filter(trade => trade.grossProfit < 0).reduce((sum, trade) => sum + trade.grossProfit, 0)
  const netProfit = trades.reduce((sum, trade) => sum + trade.netProfit, 0)
  const wins = trades.filter(trade => trade.netProfit > 0).length
  const maxDrawdown = equity.reduce((minimum, point) => Math.min(minimum, point.equity - initialCapital), 0)
  const maxDrawdownPercent = equity.reduce((minimum, point) => Math.min(minimum, point.drawdownPercent), 0)
  const first = bars[0]?.close ?? 0
  const last = bars.at(-1)?.close ?? first
  return {
    netProfit,
    netProfitPercent: initialCapital === 0 ? 0 : (netProfit / initialCapital) * 100,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss === 0 ? (grossProfit > 0 ? null : 0) : grossProfit / Math.abs(grossLoss),
    totalTrades: trades.length,
    percentProfitable: trades.length === 0 ? 0 : (wins / trades.length) * 100,
    maxDrawdown,
    maxDrawdownPercent,
    buyAndHoldPercent: first === 0 ? 0 : ((last - first) / first) * 100,
  }
}

export function runBacktest(
  bars: CandleData[],
  signals: StrategySignal[],
  config: Partial<BacktestConfig> = {},
): BacktestResult {
  const options = { ...DEFAULT_CONFIG, ...config }
  const byIndex = new Map<number, StrategySignal[]>()
  for (const signal of signals) {
    if (signal.index >= 0 && signal.index < bars.length) {
      const current = byIndex.get(signal.index) ?? []
      current.push(signal)
      byIndex.set(signal.index, current)
    }
  }

  const trades: BacktestTrade[] = []
  const equity: EquityPoint[] = []
  let cash = options.initialCapital
  let peak = cash
  let position: OpenPosition | null = null

  const closePosition = (index: number): void => {
    if (!position) return
    const bar = bars[index]
    const exitPrice = fillPrice(bar.close, position.side, false, options.slippagePercent)
    const grossProfit = (exitPrice - position.entryPrice) * position.quantity * (position.side === 'long' ? 1 : -1)
    const exitCommission = Math.abs(exitPrice * position.quantity) * (options.commissionPercent / 100)
    const commission = position.entryCommission + exitCommission
    const netProfit = grossProfit - commission
    cash += netProfit
    trades.push({
      id: `trade-${trades.length + 1}`,
      side: position.side,
      entryTime: Number(bars[position.entryIndex].timestamp),
      entryPrice: position.entryPrice,
      exitTime: Number(bar.timestamp),
      exitPrice,
      quantity: position.quantity,
      grossProfit,
      commission,
      netProfit,
      barsHeld: index - position.entryIndex,
    })
    position = null
  }

  bars.forEach((bar, index) => {
    for (const signal of byIndex.get(index) ?? []) {
      if (signal.action === 'exit') closePosition(index)
      if (signal.action === 'enter' && signal.side) {
        if (position) closePosition(index)
        const entryPrice = fillPrice(bar.close, signal.side, true, options.slippagePercent)
        const notional = cash * (options.positionSizePercent / 100)
        const quantity = entryPrice === 0 ? 0 : notional / entryPrice
        position = {
          side: signal.side,
          entryIndex: index,
          entryPrice,
          quantity,
          entryCommission: Math.abs(notional) * (options.commissionPercent / 100),
        }
      }
    }
    const unrealized = position
      ? (bar.close - position.entryPrice) * position.quantity * (position.side === 'long' ? 1 : -1) - position.entryCommission
      : 0
    const currentEquity = cash + unrealized
    peak = Math.max(peak, currentEquity)
    equity.push({
      timestamp: Number(bar.timestamp),
      equity: currentEquity,
      drawdownPercent: peak === 0 ? 0 : ((currentEquity - peak) / peak) * 100,
    })
  })
  if (position && bars.length > 0) closePosition(bars.length - 1)

  return {
    mode: 'runtime',
    config: options,
    trades,
    equity,
    bars,
    metrics: metrics(trades, options.initialCapital, equity, bars),
  }
}
