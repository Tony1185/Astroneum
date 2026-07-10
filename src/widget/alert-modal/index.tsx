import { useMemo, useState } from 'react'

import { type Component } from '@/react-shared'

import { Modal, Input, List, Checkbox } from '@/component'
import i18n from '@/i18n'
import AlertManager, {
  type Alert,
  type AlertCondition,
  type AlertFrequency,
  type AlertCreate,
  type SoundTitle,
  type SoundDuration,
  type NotificationSchedule,
  type WebhookStatus,
} from '@/chart/AlertManager'

export interface AlertModalProps {
  locale: string
  symbol: string
  timeframe?: string
  currentPrice?: number
  onClose: () => void
}

const CONDITIONS: AlertCondition[] = ['above', 'below', 'crosses_above', 'crosses_below']
const TRIGGERS: { value: AlertFrequency; key: string }[] = [
  { value: 'once', key: 'alert_trigger_once' },
  { value: 'every_bar', key: 'alert_trigger_every_bar' },
  { value: 'bar_close', key: 'alert_trigger_bar_close' },
]
const EXPIRATIONS: { value: string; key: string }[] = [
  { value: '', key: 'alert_expiration_open' },
  { value: '1d', key: 'alert_expiration_1d' },
  { value: '1w', key: 'alert_expiration_1w' },
  { value: '1m', key: 'alert_expiration_1m' },
  { value: '2m', key: 'alert_expiration_2m' },
]
const SOUND_TITLES: SoundTitle[] = ['Thin', 'Classic', 'Alert', 'Bell', 'Chime']
const SOUND_DURATIONS: SoundDuration[] = ['once', 'repeating']
const SCHEDULE_PRESETS: { value: NotificationSchedule['preset']; key: string }[] = [
  { value: '24/7', key: 'alert_schedule_24/7' },
  { value: 'weekdays', key: 'alert_schedule_weekdays' },
  { value: 'working_hours', key: 'alert_schedule_working_hours' },
  { value: 'custom', key: 'alert_schedule_custom' },
]

interface NotifConfig {
  soundEnabled: boolean
  notificationEnabled: boolean
  toastEnabled: boolean
  emailEnabled: boolean
  plainTextEnabled: boolean
  plainTextEmail: string
  webhookUrl: string
  soundTitle: SoundTitle
  soundDuration: SoundDuration
  notificationSchedule: NotificationSchedule
}

const DEFAULT_NOTIFS: NotifConfig = {
  soundEnabled: true,
  notificationEnabled: true,
  toastEnabled: false,
  emailEnabled: false,
  plainTextEnabled: false,
  plainTextEmail: '',
  webhookUrl: '',
  soundTitle: 'Thin',
  soundDuration: 'once',
  notificationSchedule: { preset: '24/7' },
}

type UrlTone = 'empty' | 'valid' | 'invalid'

function classifyWebhookUrl(raw: string): UrlTone {
  const s = raw.trim()
  if (!s) return 'empty'
  try {
    const u = new URL(s)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'invalid'
    const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '')
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return 'invalid'
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|127\.)/.test(h)) return 'invalid'
    if (h.endsWith('.local') || h.endsWith('.internal')) return 'invalid'
    return 'valid'
  } catch { return 'invalid' }
}

function isValidJson(s: string): boolean {
  try { JSON.parse(s); return true } catch { return false }
}

function computeExpiration(value: string): string | undefined {
  if (!value) return undefined
  const now = new Date()
  switch (value) {
    case '1d': now.setDate(now.getDate() + 1); break
    case '1w': now.setDate(now.getDate() + 7); break
    case '1m': now.setMonth(now.getMonth() + 1); break
    case '2m': now.setMonth(now.getMonth() + 2); break
    default: return undefined
  }
  return now.toISOString()
}

function conditionLabel(c: AlertCondition, locale: string): string {
  return i18n(`alert_${c}`, locale)
}

function webhookStatusTone(status: WebhookStatus): { color: string; bg: string; border: string; labelKey: string } {
  if (status === 'delivered') return { color: '#26A69A', bg: 'rgba(38,166,154,0.12)', border: 'rgba(38,166,154,0.40)', labelKey: 'alert_webhook_delivered' }
  if (status === 'failed') return { color: '#EF5350', bg: 'rgba(239,83,80,0.12)', border: 'rgba(239,83,80,0.40)', labelKey: 'alert_webhook_failed' }
  return { color: '#F89D3E', bg: 'rgba(249,157,62,0.12)', border: 'rgba(249,157,62,0.40)', labelKey: 'alert_webhook_sending' }
}

const HTTP_REASONS: Record<number, string> = {
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
  405: 'Method Not Allowed', 408: 'Request Timeout', 409: 'Conflict',
  410: 'Gone', 429: 'Too Many Requests', 500: 'Internal Server Error',
  501: 'Not Implemented', 502: 'Bad Gateway', 503: 'Service Unavailable',
  504: 'Gateway Timeout',
}

function formatDateGroup(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { month: 'long', day: 'numeric' })
}

function formatTimeOnly(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function alertName(alert: Alert, locale: string): string {
  return alert.note || `${alert.symbol} ${conditionLabel(alert.condition, locale)} ${alert.price}`
}

function alertMessage(alert: Alert): string {
  return alert.messageTemplate || `${alert.symbol} ${alert.condition} ${alert.price}`
}

function webhookFailureReason(alert: Alert, locale: string): string {
  if (typeof alert.webhookHttpStatus === 'number') {
    const phrase = HTTP_REASONS[alert.webhookHttpStatus] ?? `HTTP ${alert.webhookHttpStatus}`
    return `${i18n('alert_webhook_failed_prefix', locale)} — ${alert.webhookHttpStatus} ${phrase}.`
  }
  return `${i18n('alert_webhook_failed_prefix', locale)} — ${i18n('alert_webhook_timeout', locale)}.`
}

function symbolLogoUrl(symbol: string): string {
  const base = symbol.replace(/USDT$|USD$|PERP$|\.P$/i, '')
  return `https://s3-symbol-logo.tradingview.com/crypto/XTVC${base.toUpperCase()}.svg`
}

const AlertModal: Component<AlertModalProps> = props => {
  const manager = AlertManager.getInstance()

  const [alerts, setAlerts] = useState<Alert[]>(manager.getForSymbol(props.symbol))
  const [price, setPrice] = useState(String(props.currentPrice ?? ''))
  const [condition, setCondition] = useState<AlertCondition>('crosses_above')
  const [note, setNote] = useState('')
  const [trigger, setTrigger] = useState<AlertFrequency>('once')
  const [expirationChoice, setExpirationChoice] = useState('2m')
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState<'create' | 'history'>('create')
  const [view, setView] = useState<'form' | 'notifications'>('form')
  const [notifConfig, setNotifConfig] = useState<NotifConfig>(DEFAULT_NOTIFS)

  const refresh = (): void => { setAlerts(manager.getForSymbol(props.symbol)) }

  const activeAlerts = useMemo(() => alerts.filter(a => a.status === 'active'), [alerts])
  const historyAlerts = useMemo(() => alerts.filter(a => a.status !== 'active'), [alerts])
  const logAlerts = useMemo(() => historyAlerts.slice().reverse(), [historyAlerts])
  const groupedLogs = useMemo(() => {
    const groups: { dateKey: string; dateLabel: string; items: Alert[] }[] = []
    for (const alert of logAlerts) {
      if (!alert.triggeredAt) {
        const g = groups.find(g => g.dateKey === '__no_date')
        if (g) g.items.push(alert)
        else groups.push({ dateKey: '__no_date', dateLabel: '', items: [alert] })
        continue
      }
      const dateLabel = formatDateGroup(alert.triggeredAt, props.locale)
      const dateKey = new Date(alert.triggeredAt).toDateString()
      let group = groups.find(g => g.dateKey === dateKey)
      if (!group) {
        group = { dateKey, dateLabel, items: [] }
        groups.push(group)
      }
      group.items.push(alert)
    }
    return groups
  }, [logAlerts, props.locale])

  const conditionLabelText = conditionLabel(condition, props.locale)
  const defaultMessage = useMemo(() => {
    return `${props.symbol} ${conditionLabelText} ${price || '—'}`
  }, [props.symbol, conditionLabelText, price])
  const messageValue = message || defaultMessage

  const urlTone = classifyWebhookUrl(notifConfig.webhookUrl)
  const webhookEnabled = !!notifConfig.webhookUrl.trim()

  const notifSummary = useMemo(() => {
    const parts: string[] = []
    if (notifConfig.notificationEnabled) parts.push(i18n('alert_notif_app', props.locale))
    if (notifConfig.toastEnabled) parts.push(i18n('alert_notif_toast', props.locale))
    if (notifConfig.soundEnabled) parts.push(i18n('alert_notif_sound', props.locale))
    if (notifConfig.emailEnabled) parts.push(i18n('alert_notif_email', props.locale))
    if (notifConfig.webhookUrl) parts.push(i18n('alert_notif_webhook', props.locale))
    if (notifConfig.plainTextEnabled) parts.push(i18n('alert_notif_plaintext', props.locale))
    return parts.length > 0 ? parts.join(', ') : i18n('alert_notif_none', props.locale)
  }, [notifConfig, props.locale])

  const canCreate = price !== '' && isFinite(parseFloat(price))

  function updateNotif(patch: Partial<NotifConfig>): void {
    setNotifConfig(prev => ({ ...prev, ...patch }))
  }
  function toggleNotif(key: keyof NotifConfig): void {
    setNotifConfig(prev => {
      const next = { ...prev }
      next[key] = !next[key] as never
      return next
    })
  }

  function addAlert(): void {
    const p = parseFloat(price)
    if (!isFinite(p)) return
    const expiration = computeExpiration(expirationChoice)
    const create: AlertCreate = {
      symbol: props.symbol,
      condition,
      price: p,
      note: note || undefined,
      timeframe: props.timeframe,
      frequency: trigger,
      soundEnabled: notifConfig.soundEnabled,
      notificationEnabled: notifConfig.notificationEnabled,
      webhookUrl: notifConfig.webhookUrl || undefined,
      expiration,
      messageTemplate: message || undefined,
      emailEnabled: notifConfig.emailEnabled,
      plainTextEnabled: notifConfig.plainTextEnabled,
      plainTextEmail: notifConfig.plainTextEmail || undefined,
      toastEnabled: notifConfig.toastEnabled,
      notificationSchedule: notifConfig.notificationSchedule,
      soundTitle: notifConfig.soundTitle,
      soundDuration: notifConfig.soundDuration,
    }
    manager.add(create)
    setNote('')
    setPrice('')
    setView('form')
    refresh()
  }

  function deleteAlert(id: string): void {
    manager.delete(id)
    refresh()
  }

  function clearLog(): void {
    for (const a of historyAlerts) {
      manager.delete(a.id)
    }
    refresh()
  }

  return (
    <Modal
      title={view === 'notifications' ? i18n('alert_notifications', props.locale) : i18n('alerts', props.locale)}
      width={420}
      onClose={props.onClose}>
      <div className="astroneum-alert-modal">
        {view === 'notifications' ? (
          <div className="alert-notifications">
            <button
              className="alert-back-btn"
              onClick={() => setView('form')}
              aria-label={i18n('alert_back', props.locale)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M12.92 1.92 5.85 9l7.07 7.08-.84.84-7.5-7.5L4.15 9l.43-.42 7.5-7.5z"/>
              </svg>
              <span>{i18n('alert_back', props.locale)}</span>
            </button>

            <div className="alert-notif-item">
              <Checkbox
                checked={notifConfig.notificationEnabled}
                onChange={() => toggleNotif('notificationEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_app', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_app_desc', props.locale)}</div>
            </div>

            <div className="alert-notif-item">
              <Checkbox
                checked={notifConfig.toastEnabled}
                onChange={() => toggleNotif('toastEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_toast', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_toast_desc', props.locale)}</div>
            </div>

            <div className="alert-notif-item">
              <Checkbox
                checked={notifConfig.emailEnabled}
                onChange={() => toggleNotif('emailEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_email', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_email_desc', props.locale)}</div>
            </div>

            <div className="alert-notif-item">
              <Checkbox
                checked={webhookEnabled}
                onChange={() => { if (webhookEnabled) updateNotif({ webhookUrl: '' }) }}
                label={<span className="alert-notif-label">{i18n('alert_notif_webhook', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_webhook_desc', props.locale)}</div>
              <div className="alert-notif-expander">
                <Input
                  className={`alert-webhook-url alert-webhook-url-${urlTone}`}
                  placeholder="https://example.com/alert-hook"
                  value={notifConfig.webhookUrl}
                  onChange={v => updateNotif({ webhookUrl: String(v) })}/>
                {urlTone === 'invalid' && (
                  <div className="alert-webhook-validation alert-webhook-validation-invalid">
                    {i18n('alert_webhook_invalid', props.locale)}
                  </div>
                )}
                {urlTone === 'valid' && (
                  <div className="alert-webhook-validation alert-webhook-validation-valid">
                    {i18n('alert_webhook_valid', props.locale)}
                  </div>
                )}
              </div>
            </div>

            <div className="alert-notif-item">
              <Checkbox
                checked={notifConfig.soundEnabled}
                onChange={() => toggleNotif('soundEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_sound', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_sound_desc', props.locale)}</div>
              {notifConfig.soundEnabled && (
                <div className="alert-notif-expander alert-sound-selects">
                  <button
                    className="alert-dropdown"
                    onClick={() => {
                      const idx = SOUND_TITLES.indexOf(notifConfig.soundTitle)
                      updateNotif({ soundTitle: SOUND_TITLES[(idx + 1) % SOUND_TITLES.length] })
                    }}>
                    <span>{notifConfig.soundTitle}</span>
                    <span className="caret">▾</span>
                  </button>
                  <button
                    className="alert-dropdown"
                    onClick={() => {
                      const idx = SOUND_DURATIONS.indexOf(notifConfig.soundDuration)
                      updateNotif({ soundDuration: SOUND_DURATIONS[(idx + 1) % SOUND_DURATIONS.length] })
                    }}>
                    <span>{notifConfig.soundDuration === 'once' ? i18n('alert_sound_once', props.locale) : i18n('alert_sound_repeating', props.locale)}</span>
                    <span className="caret">▾</span>
                  </button>
                </div>
              )}
            </div>

            <div className="alert-notif-item">
              <Checkbox
                checked={notifConfig.plainTextEnabled}
                onChange={() => toggleNotif('plainTextEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_plaintext', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_plaintext_desc', props.locale)}</div>
              {notifConfig.plainTextEnabled && (
                <div className="alert-notif-expander">
                  <Input
                    className="alert-email-input"
                    placeholder="alternative@example.com"
                    value={notifConfig.plainTextEmail}
                    onChange={v => updateNotif({ plainTextEmail: String(v) })}/>
                </div>
              )}
            </div>

            <div className="alert-separator" />

            <div className="alert-notif-item">
              <div className="alert-notif-label">{i18n('alert_schedule', props.locale)}</div>
              <div className="alert-notif-expander">
                <button
                  className="alert-dropdown alert-dropdown-block"
                  onClick={() => {
                    const idx = SCHEDULE_PRESETS.findIndex(s => s.value === notifConfig.notificationSchedule.preset)
                    const next = SCHEDULE_PRESETS[(idx + 1) % SCHEDULE_PRESETS.length]
                    updateNotif({ notificationSchedule: { preset: next.value } })
                  }}>
                  <span>{i18n(SCHEDULE_PRESETS.find(s => s.value === notifConfig.notificationSchedule.preset)?.key ?? 'alert_schedule_24/7', props.locale)}</span>
                  <span className="caret">▾</span>
                </button>
              </div>
              <div className="alert-notif-desc">{i18n('alert_schedule_desc', props.locale)}</div>
            </div>

            <button
              className="astroneum-button button is-small is-primary alert-submit-btn alert-apply-btn"
              onClick={() => setView('form')}
              aria-label={i18n('alert_apply', props.locale)}>
              {i18n('alert_apply', props.locale)}
            </button>
          </div>
        ) : (
          <>
            <div className="astroneum-alert-modal-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={tab === 'create'}
                className={`tab-btn ${tab === 'create' ? 'active' : ''}`}
                onClick={() => setTab('create')}>
                {i18n('alert_create', props.locale)}
              </button>
              <button
                role="tab"
                aria-selected={tab === 'history'}
                className={`tab-btn ${tab === 'history' ? 'active' : ''}`}
                onClick={() => setTab('history')}>
                {i18n('alert_log', props.locale)} ({historyAlerts.length})
              </button>
            </div>

            {tab === 'create' && (
              <>
                <div className="astroneum-alert-modal-form">
                  <label className="alert-field-label">{i18n('alert_condition', props.locale)}</label>
                  <div className="alert-condition-row" role="group" aria-label="Alert condition">
                    {CONDITIONS.map(c => (
                      <button
                        key={c}
                        className={`alert-cond-btn ${condition === c ? 'active' : ''}`}
                        role="radio"
                        aria-checked={condition === c}
                        onClick={() => setCondition(c)}>
                        {conditionLabel(c, props.locale)}
                      </button>
                    ))}
                  </div>

                  <label className="alert-field-label">{i18n('alert_price', props.locale)}</label>
                  <Input
                    className="alert-price-input"
                    precision={8}
                    min={0}
                    placeholder={String(props.currentPrice ?? 0)}
                    value={price}
                    onChange={v => setPrice(String(v))}/>

                  <label className="alert-field-label">{i18n('alert_trigger', props.locale)}</label>
                  <button
                    className="alert-dropdown alert-dropdown-block"
                    onClick={() => {
                      const idx = TRIGGERS.findIndex(t => t.value === trigger)
                      setTrigger(TRIGGERS[(idx + 1) % TRIGGERS.length].value)
                    }}>
                    <span>{i18n(TRIGGERS.find(t => t.value === trigger)?.key ?? 'alert_trigger_once', props.locale)}</span>
                    <span className="caret">▾</span>
                  </button>

                  <label className="alert-field-label">{i18n('alert_expiration', props.locale)}</label>
                  <button
                    className="alert-dropdown alert-dropdown-block"
                    onClick={() => {
                      const idx = EXPIRATIONS.findIndex(e => e.value === expirationChoice)
                      setExpirationChoice(EXPIRATIONS[(idx + 1) % EXPIRATIONS.length].value)
                    }}>
                    <span>{i18n(EXPIRATIONS.find(e => e.value === expirationChoice)?.key ?? 'alert_expiration_open', props.locale)}</span>
                    <span className="caret">▾</span>
                  </button>

                  <label className="alert-field-label">{i18n('alert_note', props.locale)}</label>
                  <Input
                    className="alert-note-input"
                    placeholder={i18n('alert_note_placeholder', props.locale)}
                    value={note}
                    onChange={v => setNote(String(v))}/>

                  <label className="alert-field-label">{i18n('alert_message', props.locale)}</label>
                  <textarea
                    className="alert-message-textarea"
                    value={messageValue}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    spellCheck={false}
                    placeholder={`${props.symbol} ${conditionLabelText} ${price || '0'}`}/>
                  <div className="alert-message-hint">
                    {webhookEnabled
                      ? `${i18n('alert_webhook_body', props.locale)} · ${isValidJson(messageValue) ? 'application/json' : 'text/plain'}`
                      : i18n('alert_message_hint', props.locale)}
                  </div>

                  <label className="alert-field-label">{i18n('alert_notifications', props.locale)}</label>
                  <button
                    className="alert-dropdown alert-dropdown-block"
                    onClick={() => setView('notifications')}>
                    <span>{notifSummary}</span>
                    <span className="caret">▾</span>
                  </button>

                  <button
                    className="astroneum-button button is-small is-primary alert-submit-btn"
                    disabled={!canCreate}
                    onClick={addAlert}
                    aria-label={i18n('alert_add', props.locale)}>
                    {i18n('alert_add', props.locale)}
                  </button>
                </div>

                {activeAlerts.length > 0 && (
                  <>
                    <div className="alert-section-label">{i18n('alert_active', props.locale)} ({activeAlerts.length})</div>
                    <List className="astroneum-alert-modal-list">
                      {activeAlerts.map(alert => (
                        <li key={alert.id} className="alert-list-row">
                          <span className={`alert-cond-badge alert-cond-${alert.condition}`}>
                            {conditionLabel(alert.condition, props.locale)}
                          </span>
                          <span className="alert-price">{alert.price}</span>
                          {alert.note && <span className="alert-note">{alert.note}</span>}
                          {alert.webhookUrl && alert.webhookStatus && (
                            <WebhookBadge
                              status={alert.webhookStatus}
                              httpStatus={alert.webhookHttpStatus}
                              at={alert.webhookStatusAt}
                              locale={props.locale}/>
                          )}
                          <button
                            className="alert-delete-btn"
                            aria-label="Delete alert"
                            onClick={() => deleteAlert(alert.id)}>
                            ×
                          </button>
                        </li>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}

            {tab === 'history' && (
              logAlerts.length > 0
                ? (
                  <div className="alert-log">
                    <div className="alert-log-subheader">
                      <div className="alert-log-subheader-left">
                        <button
                          className="alert-log-clear-btn"
                          onClick={clearLog}
                          title={i18n('alert_clear_log', props.locale)}
                          aria-label={i18n('alert_clear_log', props.locale)}>
                          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                            <path stroke="currentColor" d="M5.5 16.5c1 3 7 7 11 7 2-4 2-8.5 2-8.5s-1-3.5-2-4-4.5.5-4.5.5-3 3.5-6.5 5z"/>
                            <path stroke="currentColor" d="M15.5 11l3-6s.5-1 1.5-.5.5 1.5.5 1.5l-3 6M12 11.5l6.5 3.5M7.5 19c2-.5 4-2.5 4-2.5m0 5.5c2-1 3-3.5 3-3.5"/>
                          </svg>
                        </button>
                      </div>
                      <div className="alert-log-subheader-right">
                        <button
                          className="alert-log-actions-btn"
                          title={i18n('alert_actions', props.locale)}
                          aria-label={i18n('alert_actions', props.locale)}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM5 14.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm9.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 14.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zm9.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM19 14.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="alert-log-list">
                      {groupedLogs.map(group => (
                        <div key={group.dateKey} className="alert-log-date-group">
                          {group.dateLabel && (
                            <div className="alert-log-date-label">{group.dateLabel}</div>
                          )}
                          {group.items.map(alert => (
                            <LogItem
                              key={alert.id}
                              alert={alert}
                              locale={props.locale}
                              onDelete={() => deleteAlert(alert.id)}/>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )
                : <div className="alert-empty">{i18n('alert_no_log', props.locale)}</div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

function WebhookBadge({ status, httpStatus, at, locale }: { status: WebhookStatus; httpStatus?: number; at?: string; locale: string }) {
  const tone = webhookStatusTone(status)
  const label = i18n(tone.labelKey, locale)
  const title = `Webhook ${label.toLowerCase()}${typeof httpStatus === 'number' ? ` · HTTP ${httpStatus}` : ''}${at ? ` · ${new Date(at).toLocaleString(locale)}` : ''}`
  return (
    <span className="alert-webhook-badge" title={title} style={{ color: tone.color, background: tone.bg, border: `1px solid ${tone.border}` }}>
      {label}{typeof httpStatus === 'number' ? ` · ${httpStatus}` : ''}
    </span>
  )
}

const SuccessIcon = () => (
  <svg viewBox="0 0 18 18" width="18" height="18" fill="none">
    <path fill="currentColor" d="M9 1a8 8 0 1 1 0 16A8 8 0 0 1 9 1m-.79 9.041L5.952 8.154 5 9.306l3.273 2.743L13 7.557l-1.016-1.09z"/>
  </svg>
)

const ErrorIcon = () => (
  <svg viewBox="0 0 18 18" width="18" height="18" fill="none">
    <path fill="currentColor" d="M9 1a8 8 0 1 1 0 16A8 8 0 0 1 9 1m0 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2m0-8c-.785 0-1.383.705-1.254 1.48l.671 4.027a.591.591 0 0 0 1.165 0l.67-4.028A1.27 1.27 0 0 0 9 4"/>
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 18 18" width="18" height="18" fill="currentColor">
    <path d="M12 4h3v1h-1.04l-.88 9.64a1.5 1.5 0 0 1-1.5 1.36H6.42a1.5 1.5 0 0 1-1.5-1.36L4.05 5H3V4h3v-.5C6 2.67 6.67 2 7.5 2h3c.83 0 1.5.67 1.5 1.5V4ZM7.5 3a.5.5 0 0 0-.5.5V4h4v-.5a.5.5 0 0 0-.5-.5h-3ZM5.05 5l.87 9.55a.5.5 0 0 0 .5.45h5.17a.5.5 0 0 0 .5-.45L12.94 5h-7.9Z"/>
  </svg>
)

function LogItem({ alert, locale, onDelete }: { alert: Alert; locale: string; onDelete: () => void }) {
  const name = alertName(alert, locale)
  const msg = alertMessage(alert)
  const hasWebhook = !!alert.webhookUrl && !!alert.webhookStatus
  const ws = alert.webhookStatus
  const tone = ws ? webhookStatusTone(ws) : null
  const [logoError, setLogoError] = useState(false)
  const ticker = alert.symbol
  const logoUrl = symbolLogoUrl(alert.symbol)
  const tf = alert.timeframe

  return (
    <div className="alert-log-item">
      <div className="alert-log-item-name">{name}</div>
      <div className="alert-log-item-message">{msg}</div>
      <div className="alert-log-item-attrs">
        {!logoError ? (
          <img
            className="alert-log-item-logo"
            src={logoUrl}
            alt=""
            crossOrigin="anonymous"
            onError={() => setLogoError(true)}/>
        ) : (
          <span className="alert-log-item-symbol-letter">{ticker.charAt(0)}</span>
        )}
        <span className="alert-log-item-ticker">{ticker}{tf ? `, ${tf}` : ''}</span>
        {alert.triggeredAt && (
          <span className="alert-log-item-time">{formatTimeOnly(alert.triggeredAt, locale)}</span>
        )}
      </div>
      {hasWebhook && ws && tone && (
        <div className={`alert-log-webhook-status alert-log-webhook-${ws}`}>
          <span className="alert-log-webhook-icon" style={{ color: tone.color }}>
            {ws === 'delivered' ? <SuccessIcon/> : <ErrorIcon/>}
          </span>
          <span className="alert-log-webhook-text">
            {ws === 'delivered'
              ? i18n('alert_webhook_success', locale)
              : ws === 'failed'
                ? webhookFailureReason(alert, locale)
                : i18n('alert_webhook_sending', locale)}
            {ws === 'failed' && (
              <a className="alert-log-learn-more" href="https://www.tradingview.com/support/solutions/43000776894/" target="_blank" rel="noopener noreferrer">
                {' '}{i18n('alert_webhook_learn_more', locale)}
              </a>
            )}
          </span>
        </div>
      )}
      <div className="alert-log-item-overlay">
        <button className="alert-log-item-delete" onClick={onDelete} title="Delete" aria-label="Delete">
          <TrashIcon/>
        </button>
      </div>
    </div>
  )
}

export default AlertModal
