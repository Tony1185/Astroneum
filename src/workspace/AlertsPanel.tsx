import { useEffect, useMemo, useState } from 'react'

import AlertManager, { type Alert } from '@/chart/AlertManager'
import AlertModal from '@/widget/alert-modal'
import { type IndicatorSourceOption } from '@/widget/alert-modal'

export interface WorkspaceAlertsProps {
  symbol: string
  currentPrice?: number
  indicatorSources?: IndicatorSourceOption[]
  onSymbolChange?: (symbol: string) => void
}

function conditionText (alert: Alert): string {
  if (alert.conditions?.length) return alert.conditions.map(condition => `${condition.operator} ${condition.value}`).join(' and ')
  return `${alert.condition} ${alert.price}`
}

export default function WorkspaceAlerts ({ symbol, currentPrice, indicatorSources, onSymbolChange }: WorkspaceAlertsProps) {
  const manager = AlertManager.getInstance()
  const [alerts, setAlerts] = useState<Alert[]>([...manager.getAll()])
  const [currentOnly, setCurrentOnly] = useState(false)
  const [target, setTarget] = useState<Alert | null | 'create'>(null)

  useEffect(() => manager.onChange(next => setAlerts([...next])), [manager])

  const visible = useMemo(() => alerts.filter(alert => !currentOnly || alert.symbol === symbol), [alerts, currentOnly, symbol])

  return (
    <section className="astroneum-workspace-alerts" aria-label="Alerts">
      <header className="astroneum-workspace-alerts-header">
        <strong>Alerts</strong>
        <span>{visible.length}</span>
        <button aria-pressed={currentOnly} onClick={() => setCurrentOnly(value => !value)}>{currentOnly ? symbol : 'All'}</button>
        <button onClick={() => setTarget('create')}>Create</button>
      </header>
      <div className="astroneum-workspace-alerts-list">
        {visible.length === 0 ? <div className="astroneum-workspace-alerts-empty"><strong>No active alerts</strong><button onClick={() => setTarget('create')}>Create alert</button></div> : visible.map(alert => (
          <article key={alert.id} className="astroneum-workspace-alert-row" onClick={() => setTarget(alert)}>
            <span className={`astroneum-workspace-alert-state is-${alert.status}`}>{alert.status}</span>
            <div><strong>{alert.symbol}{alert.timeframe ? `, ${alert.timeframe}` : ''}</strong><span>{conditionText(alert)}</span></div>
            <div className="astroneum-workspace-alert-actions" onClick={event => event.stopPropagation()}>
              {(alert.status === 'active' || alert.status === 'paused') && <button onClick={() => manager.togglePause(alert.id)}>{alert.status === 'active' ? 'Pause' : 'Resume'}</button>}
              <button onClick={() => manager.delete(alert.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      {target && <AlertModal locale="en-US" symbol={target === 'create' ? symbol : target.symbol} timeframe={target === 'create' ? 'D' : target.timeframe ?? 'D'} currentPrice={currentPrice} editAlert={target === 'create' ? undefined : target} indicatorSources={indicatorSources} onSymbolChange={onSymbolChange} onClose={() => setTarget(null)} />}
    </section>
  )
}
