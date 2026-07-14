'use client'

import './panels.css'
import { useState, useCallback } from 'react'
import { ScriptEngine, type CompiledStrategy } from '@tony01/astroneum/script'
import type { BacktestResult } from '@tony01/astroneum'

const PLACEHOLDER = `// Astroneum Pine â€” JavaScript indicator
// Available: ta.sma, ta.ema, ta.rsi, ta.macd, ta.bbands, ...

study('My SMA', { overlay: true })

const len = input('Length', 20)
const smaLine = ta.sma(close, len)

plot(smaLine, { title: 'SMA' })
`

const STRATEGY_PLACEHOLDER = `// Astroneum strategy â€” deterministic bar-close signals
function strategySignals({ close, ta }) {
  const fast = ta.sma(close, 10)
  const slow = ta.sma(close, 20)
  const signals = []
  for (let index = 1; index < close.length; index++) {
    if (fast[index - 1] <= slow[index - 1] && fast[index] > slow[index]) signals.push({ index, action: 'enter', side: 'long' })
    if (fast[index - 1] >= slow[index - 1] && fast[index] < slow[index]) signals.push({ index, action: 'exit' })
  }
  return signals
}
`

interface PineEditorPanelProps {
  onCompiled?: (indicatorName: string) => void
  onStrategyCompiled?: (strategy: CompiledStrategy) => void
}

export default function PineEditorPanel({ onCompiled, onStrategyCompiled }: PineEditorPanelProps) {
  const [source, setSource] = useState(PLACEHOLDER)
  const [mode, setMode] = useState<'indicator' | 'strategy'>('indicator')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCompile = useCallback(() => {
    setError('')
    setSuccess('')
    try {
      const engine = ScriptEngine.getInstance()
      if (mode === 'strategy') {
        const strategy = engine.compileStrategy(source)
        onStrategyCompiled?.(strategy)
        setSuccess(`Ran "${strategy.name}" against the current chart history`)
        return
      }
      const compiled = engine.compile(source)
      if (compiled.name) {
        onCompiled?.(compiled.name)
        setSuccess(`Compiled and added "${compiled.name}" to chart`)
      }
    } catch (err) {
      setError(String((err as Error).message ?? err))
    }
  }, [mode, source, onCompiled, onStrategyCompiled])

  const selectMode = (next: 'indicator' | 'strategy') => {
    setMode(next)
    setSource(next === 'strategy' ? STRATEGY_PLACEHOLDER : PLACEHOLDER)
    setError('')
    setSuccess('')
  }

  return (
    <div className="term-pine">
      <div className="term-pine-toolbar">
        <div className="term-pine-mode" role="tablist" aria-label="Script type">
          <button role="tab" aria-selected={mode === 'indicator'} className={mode === 'indicator' ? 'is-active' : ''} onClick={() => selectMode('indicator')}>Indicator</button>
          <button role="tab" aria-selected={mode === 'strategy'} className={mode === 'strategy' ? 'is-active' : ''} onClick={() => selectMode('strategy')}>Strategy</button>
        </div>
        <span className="term-pine-badge">{mode === 'strategy' ? 'Backtest' : 'Pine v5'}</span>
        <button className="term-pine-btn primary" onClick={handleCompile}>{mode === 'strategy' ? 'Run backtest' : 'Add to chart'}</button>
        <button className="term-pine-btn" onClick={() => selectMode(mode)}>Reset</button>
      </div>
      <div className="term-pine-editor">
        <textarea
          className="term-pine-code"
          value={source}
          onChange={e => setSource(e.target.value)}
          spellCheck={false}
          placeholder={PLACEHOLDER}
        />
      </div>
      {error && <div className="term-pine-errors">{error}</div>}
      {success && <div className="term-pine-success">{success}</div>}
    </div>
  )
}

const STRATEGY_TABS = ['Summary', 'Performance', 'Trades', 'Equity', 'Properties'] as const

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

export function StrategyTesterPanel({ result, error }: { result?: BacktestResult | null; error?: string | null }) {
  const [tab, setTab] = useState<(typeof STRATEGY_TABS)[number]>('Summary')
  if (!result) {
    return <div className="term-strategy-empty"><div className="term-strategy-empty-icon">&#9654;</div><div className="term-strategy-empty-text">{error ?? 'No strategy result'}</div><div className="term-strategy-empty-hint">Select Strategy in Pine Editor, then run it against the current chart history.</div></div>
  }
  const { metrics, config } = result
  const expectedPayoff = metrics.totalTrades === 0 ? 0 : metrics.netProfit / metrics.totalTrades
  const returns = result.equity.slice(1).map((point, index) => (point.equity - result.equity[index].equity) / result.equity[index].equity).filter(Number.isFinite)
  const average = returns.reduce((sum, value) => sum + value, 0) / (returns.length || 1)
  const deviation = Math.sqrt(returns.reduce((sum, value) => sum + (value - average) ** 2, 0) / (returns.length || 1))
  const downside = Math.sqrt(returns.filter(value => value < 0).reduce((sum, value) => sum + value ** 2, 0) / (returns.filter(value => value < 0).length || 1))
  const sharpe = deviation === 0 ? null : average / deviation
  const sortino = downside === 0 ? null : average / downside

  const summary = (
    <div className="term-strategy-grid">
      <Metric label="Net profit" value={money(metrics.netProfit)} positive />
      <Metric label="Total trades" value={String(metrics.totalTrades)} />
      <Metric label="Percent profitable" value={`${metrics.percentProfitable.toFixed(2)}%`} />
      <Metric label="Profit factor" value={metrics.profitFactor?.toFixed(2) ?? '—'} />
      <Metric label="Max drawdown" value={`${metrics.maxDrawdownPercent.toFixed(2)}%`} negative />
      <Metric label="Buy & hold return" value={`${metrics.buyAndHoldPercent.toFixed(2)}%`} />
    </div>
  )

  return (
    <div className="term-strategy">
      <div className="term-strategy-heading">
        <div>
          <strong>Strategy report</strong>
          <span className="term-strategy-runtime">Runtime result</span>
        </div>
        <span className="term-strategy-hint">Bar-close fills · {result.bars.length} bars</span>
      </div>
      <div className="term-strategy-tabs" role="tablist" aria-label="Strategy report">
        {STRATEGY_TABS.map(item => (
          <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === 'Summary' && summary}
      {tab === 'Performance' && <div className="term-strategy-grid"><Metric label="Gross profit" value={money(metrics.grossProfit)} positive /><Metric label="Gross loss" value={money(metrics.grossLoss)} negative /><Metric label="Net profit %" value={`${metrics.netProfitPercent.toFixed(2)}%`} positive /><Metric label="Profit factor" value={metrics.profitFactor?.toFixed(2) ?? '—'} /><Metric label="Expected payoff" value={money(expectedPayoff)} /><Metric label="Sharpe ratio" value={sharpe?.toFixed(2) ?? '—'} /><Metric label="Sortino ratio" value={sortino?.toFixed(2) ?? '—'} /></div>}
      {tab === 'Trades' && <div className="term-strategy-table"><div className="term-strategy-row term-strategy-table-head"><span>Side</span><span>Entry</span><span>Exit</span><span>P&amp;L</span></div>{result.trades.map(trade => <div className="term-strategy-row" key={trade.id}><span>{trade.side}</span><span>{money(trade.entryPrice)}</span><span>{money(trade.exitPrice)}</span><span className={trade.netProfit >= 0 ? 'is-positive' : 'is-negative'}>{money(trade.netProfit)}</span></div>)}</div>}
      {tab === 'Equity' && <div className="term-equity-list">{result.equity.map(point => <div key={point.timestamp}><span>{new Date(point.timestamp).toLocaleDateString()}</span><strong>{money(point.equity)}</strong><span>{point.drawdownPercent.toFixed(2)}%</span></div>)}</div>}
      {tab === 'Properties' && <div className="term-strategy-grid"><Metric label="Initial capital" value={money(config.initialCapital)} /><Metric label="Position size" value={`${config.positionSizePercent}%`} /><Metric label="Commission" value={`${config.commissionPercent}%`} /><Metric label="Slippage" value={`${config.slippagePercent}%`} /></div>}
    </div>
  )
}

function Metric({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return <div className="term-strategy-metric"><span>{label}</span><strong className={positive ? 'is-positive' : negative ? 'is-negative' : ''}>{value}</strong></div>
}

export function TradingPanel() {
  return (
    <div className="term-trading">
      <div className="term-trading-empty">
        <div className="term-trading-empty-icon">ðŸ’¼</div>
        <div className="term-trading-empty-text">No broker connected</div>
        <div className="term-trading-empty-hint">
          Connect a broker to place orders and track positions from the terminal
        </div>
      </div>
    </div>
  )
}

export function StubPanel({ title, icon, hint }: { title: string; icon: string; hint: string }) {
  return (
    <div className="term-panel-stub">
      <div className="term-panel-stub-icon">{icon}</div>
      <div className="term-panel-stub-title">{title}</div>
      <div className="term-panel-stub-text">{hint}</div>
    </div>
  )
}
