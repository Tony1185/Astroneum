import { useMemo, useState, useCallback } from 'react'

import { type Component } from '@/react-shared'

import { Modal, Input, Checkbox, Dropdown } from '@/component'
import i18n from '@/i18n'
import AlertManager, {
  type Alert,
  type AlertOperator,
  type AlertFrequency,
  type AlertConditionDef,
  type AlertSource,
  type SoundTitle,
  type SoundDuration,
  type NotificationSchedule,
  type WebhookStatus,
} from '@/chart/AlertManager'

export interface IndicatorSourceOption {
  paneId: string
  name: string
  plot: string
  shortName: string
}

export interface AlertModalProps {
  locale: string
  symbol: string
  timeframe?: string
  currentPrice?: number
  initialPrice?: number
  editAlert?: Alert
  indicatorSources?: IndicatorSourceOption[]
  onSymbolChange?: (symbol: string) => void
  onClose: () => void
}

const OPERATORS: { value: AlertOperator; key: string }[] = [
  { value: 'crosses_above', key: 'alert_crosses_above' },
  { value: 'crosses_below', key: 'alert_crosses_below' },
  { value: 'crosses', key: 'alert_crosses' },
  { value: 'above', key: 'alert_above' },
  { value: 'below', key: 'alert_below' },
  { value: 'is_between', key: 'alert_is_between' },
]
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
  soundEnabled: false,
  notificationEnabled: true,
  toastEnabled: true,
  emailEnabled: false,
  plainTextEnabled: false,
  plainTextEmail: '',
  webhookUrl: '',
  soundTitle: 'Thin',
  soundDuration: 'once',
  notificationSchedule: { preset: '24/7' },
}

type SubmitState = 'editing' | 'invalid' | 'submitting' | 'success' | 'error'

function classifyWebhookUrl(raw: string): 'empty' | 'valid' | 'invalid' {
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

function operatorLabel(op: AlertOperator, locale: string): string {
  return i18n(OPERATORS.find(o => o.value === op)?.key ?? 'alert_crosses_above', locale)
}

function symbolLogoUrl(symbol: string): string {
  const base = symbol.replace(/USDT$|USD$|PERP$|\.P$/i, '')
  return `https://s3-symbol-logo.tradingview.com/crypto/XTVC${base.toUpperCase()}.svg`
}

function condId(): string {
  return `cond_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

const AlertModal: Component<AlertModalProps> = props => {
  const manager = AlertManager.getInstance()
  const isEdit = !!props.editAlert

  const buildInitialConditions = (): AlertConditionDef[] => {
    if (props.editAlert?.conditions?.length) {
      return props.editAlert.conditions.map(c => ({ ...c }))
    }
    return [{
      id: condId(),
      source: { type: 'price' },
      operator: 'crosses_above',
      value: props.initialPrice ?? props.currentPrice ?? 0,
    }]
  }

  const [conditions, setConditions] = useState<AlertConditionDef[]>(buildInitialConditions)
  const [trigger, setTrigger] = useState<AlertFrequency>(props.editAlert?.frequency ?? 'once')
  const [expirationChoice, setExpirationChoice] = useState('2m')
  const [message, setMessage] = useState(props.editAlert?.messageTemplate ?? '')
  const [view, setView] = useState<'form' | 'notifications'>('form')
  const [messageExpanded, setMessageExpanded] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>('editing')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [notifConfig, setNotifConfig] = useState<NotifConfig>(() => {
    if (props.editAlert) {
      return {
        soundEnabled: props.editAlert.soundEnabled ?? DEFAULT_NOTIFS.soundEnabled,
        notificationEnabled: props.editAlert.notificationEnabled ?? DEFAULT_NOTIFS.notificationEnabled,
        toastEnabled: props.editAlert.toastEnabled ?? DEFAULT_NOTIFS.toastEnabled,
        emailEnabled: props.editAlert.emailEnabled ?? DEFAULT_NOTIFS.emailEnabled,
        plainTextEnabled: props.editAlert.plainTextEnabled ?? DEFAULT_NOTIFS.plainTextEnabled,
        plainTextEmail: props.editAlert.plainTextEmail ?? DEFAULT_NOTIFS.plainTextEmail,
        webhookUrl: props.editAlert.webhookUrl ?? DEFAULT_NOTIFS.webhookUrl,
        soundTitle: props.editAlert.soundTitle ?? DEFAULT_NOTIFS.soundTitle,
        soundDuration: props.editAlert.soundDuration ?? DEFAULT_NOTIFS.soundDuration,
        notificationSchedule: props.editAlert.notificationSchedule ?? DEFAULT_NOTIFS.notificationSchedule,
      }
    }
    return DEFAULT_NOTIFS
  })
  const [notifDraft, setNotifDraft] = useState<NotifConfig | null>(null)

  const sourceOptions = useMemo(() => {
    const opts = [{ value: 'price', label: i18n('alert_source_price', props.locale) }]
    for (const ind of props.indicatorSources ?? []) {
      opts.push({ value: `ind:${ind.paneId}:${ind.name}:${ind.plot}`, label: `${ind.shortName} ${ind.plot}` })
    }
    return opts
  }, [props.indicatorSources, props.locale])

  const operatorOptions = useMemo(() =>
    OPERATORS.map(o => ({ value: o.value, label: i18n(o.key, props.locale) })),
    [props.locale])

  const triggerOptions = useMemo(() =>
    TRIGGERS.map(t => ({ value: t.value, label: i18n(t.key, props.locale) })),
    [props.locale])

  const expirationOptions = useMemo(() =>
    EXPIRATIONS.map(e => ({ value: e.value, label: i18n(e.key, props.locale) })),
    [props.locale])

  const soundTitleOptions = useMemo(() =>
    SOUND_TITLES.map(s => ({ value: s, label: s })), [])

  const soundDurationOptions = useMemo(() =>
    SOUND_DURATIONS.map(d => ({ value: d, label: i18n(d === 'once' ? 'alert_sound_once' : 'alert_sound_repeating', props.locale) })),
    [props.locale])

  const scheduleOptions = useMemo(() =>
    SCHEDULE_PRESETS.map(s => ({ value: s.value, label: i18n(s.key, props.locale) })),
    [props.locale])

  const conditionLabel = useMemo(() => {
    const parts = conditions.map(c => {
      const srcLabel = c.source.type === 'price'
        ? i18n('alert_source_price', props.locale)
        : `${c.source.shortName ?? c.source.name} ${c.source.plot}`
      return `${srcLabel} ${operatorLabel(c.operator, props.locale)} ${c.value}${c.secondValue !== undefined ? `\u2013${c.secondValue}` : ''}`
    })
    return parts.join(' AND ')
  }, [conditions, props.locale])

  const defaultMessage = useMemo(() => `${props.symbol} ${conditionLabel}`, [props.symbol, conditionLabel])
  const messageValue = message || defaultMessage

  const urlTone = classifyWebhookUrl(notifDraft?.webhookUrl ?? notifConfig.webhookUrl)

  const notifSummary = useMemo(() => {
    const cfg = notifDraft ?? notifConfig
    const parts: string[] = []
    if (cfg.notificationEnabled) parts.push(i18n('alert_notif_app', props.locale))
    if (cfg.toastEnabled) parts.push(i18n('alert_notif_toast', props.locale))
    if (cfg.soundEnabled) parts.push(i18n('alert_notif_sound', props.locale))
    if (cfg.emailEnabled) parts.push(i18n('alert_notif_email', props.locale))
    if (cfg.webhookUrl) parts.push(i18n('alert_notif_webhook', props.locale))
    if (cfg.plainTextEnabled) parts.push(i18n('alert_notif_plaintext', props.locale))
    return parts.length > 0 ? parts.join(', ') : i18n('alert_notif_none', props.locale)
  }, [notifConfig, notifDraft, props.locale])

  const canSubmit = useMemo(() => {
    return conditions.every(c => isFinite(c.value) && c.value > 0) &&
      conditions.length > 0 &&
      conditions.every(c => c.operator !== 'is_between' || (c.secondValue !== undefined && isFinite(c.secondValue)))
  }, [conditions])

  function updateNotif(patch: Partial<NotifConfig>): void {
    setNotifDraft(prev => {
      const base = prev ?? notifConfig
      return { ...base, ...patch }
    })
  }
  function toggleNotif(key: keyof NotifConfig): void {
    setNotifDraft(prev => {
      const base = prev ?? notifConfig
      const next = { ...base }
      next[key] = !next[key] as never
      return next
    })
  }

  function updateCondition(id: string, patch: Partial<AlertConditionDef>): void {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
    setSubmitState('editing')
    setValidationError(null)
  }

  function addCondition(): void {
    setConditions(prev => [...prev, {
      id: condId(),
      source: { type: 'price' },
      operator: 'crosses_above',
      value: props.currentPrice ?? 0,
    }])
  }

  function removeCondition(id: string): void {
    setConditions(prev => prev.length > 1 ? prev.filter(c => c.id !== id) : prev)
  }

  function parseSourceValue(value: string): AlertSource {
    if (value === 'price') return { type: 'price' }
    const parts = value.split(':')
    if (parts[0] === 'ind' && parts.length >= 4) {
      const [, paneId, name, plot] = parts
      const ind = props.indicatorSources?.find(i => i.paneId === paneId && i.name === name && i.plot === plot)
      return { type: 'indicator', paneId, name, plot, shortName: ind?.shortName ?? name }
    }
    return { type: 'price' }
  }

  const handleSubmit = useCallback((): void => {
    if (!canSubmit) {
      setSubmitState('invalid')
      setValidationError(i18n('alert_invalid_condition', props.locale))
      return
    }
    setSubmitState('submitting')
    setValidationError(null)

    const expiration = computeExpiration(expirationChoice)
    const cfg = notifDraft ?? notifConfig
    const payload = {
      symbol: props.symbol,
      conditions: conditions.map(c => ({ ...c, source: c.source })),
      price: conditions[0]?.value ?? 0,
      condition: conditions[0]?.operator ?? 'crosses_above',
      note: props.editAlert?.note,
      timeframe: props.timeframe,
      frequency: trigger,
      soundEnabled: cfg.soundEnabled,
      notificationEnabled: cfg.notificationEnabled,
      webhookUrl: cfg.webhookUrl || undefined,
      expiration,
      messageTemplate: message || undefined,
      emailEnabled: cfg.emailEnabled,
      plainTextEnabled: cfg.plainTextEnabled,
      plainTextEmail: cfg.plainTextEmail || undefined,
      toastEnabled: cfg.toastEnabled,
      notificationSchedule: cfg.notificationSchedule,
      soundTitle: cfg.soundTitle,
      soundDuration: cfg.soundDuration,
    }

    try {
      if (isEdit && props.editAlert) {
        manager.update(props.editAlert.id, payload)
      } else {
        manager.add(payload)
      }
      setSubmitState('success')
      setTimeout(() => props.onClose(), 400)
    } catch {
      setSubmitState('error')
      setValidationError(i18n('alert_quota_exceeded', props.locale))
    }
  }, [canSubmit, conditions, expirationChoice, isEdit, manager, message, notifConfig, notifDraft, props, trigger])

  const enterNotifications = () => {
    setNotifDraft({ ...notifConfig })
    setView('notifications')
  }
  const applyNotifications = () => {
    if (notifDraft) setNotifConfig(notifDraft)
    setNotifDraft(null)
    setView('form')
  }
  const cancelNotifications = () => {
    setNotifDraft(null)
    setView('form')
  }

  const headerContent = view === 'notifications' ? (
    <p id="astroneum-alert-title" className="modal-card-title">{i18n('alert_notifications', props.locale)}</p>
  ) : (
    <div className="alert-header-content">
      <span className="alert-header-prefix">{i18n('alert_create_on', props.locale)}</span>
      <div className="alert-symbol-pill" onClick={() => props.onSymbolChange?.(props.symbol)}>
        <img
          src={symbolLogoUrl(props.symbol)}
          alt=""
          className="alert-symbol-logo"
          crossOrigin="anonymous"
          onError={(e: Event) => { (e.target as HTMLImageElement).style.display = 'none' }}/>
        <span className="alert-symbol-ticker">{props.symbol}</span>
        {props.onSymbolChange && (
          <svg width="12" height="12" viewBox="0 0 18 18" fill="currentColor" className="alert-symbol-caret">
            <path d="M3.92 7.83 9 12.29l5.08-4.46-1-1.13L9 10.29l-4.09-3.6-.99 1.14Z"/>
          </svg>
        )}
      </div>
    </div>
  )

  const footerButtons = view === 'notifications'
    ? [
        { children: i18n('cancel', props.locale), onClick: cancelNotifications, className: 'is-small is-gray' },
        { children: i18n('alert_apply', props.locale), onClick: applyNotifications, className: 'is-small is-primary' },
      ]
    : [
        { children: i18n('cancel', props.locale), onClick: props.onClose, className: 'is-small is-gray' },
        {
          children: submitState === 'submitting'
            ? (isEdit ? i18n('alert_saving', props.locale) : i18n('alert_submitting', props.locale))
            : isEdit ? i18n('alert_save', props.locale) : i18n('alert_create_button', props.locale),
          onClick: handleSubmit,
          disabled: !canSubmit || submitState === 'submitting',
          className: 'is-small is-primary',
        },
      ]

  const activeNotif = notifDraft ?? notifConfig

  return (
    <Modal
      width={440}
      headerContent={headerContent}
      onBack={view === 'notifications' ? cancelNotifications : undefined}
      onEscape={view === 'notifications' ? cancelNotifications : undefined}
      buttons={footerButtons}
      onClose={props.onClose}
      initialFocus="body">
      <div className="astroneum-alert-modal">
        {view === 'notifications' ? (
          <div className="alert-notifications">
            <div className="alert-notif-item">
              <Checkbox
                checked={activeNotif.notificationEnabled}
                onChange={() => toggleNotif('notificationEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_app', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_app_desc', props.locale)}</div>
            </div>
            <div className="alert-notif-item">
              <Checkbox
                checked={activeNotif.toastEnabled}
                onChange={() => toggleNotif('toastEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_toast', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_toast_desc', props.locale)}</div>
            </div>
            <div className="alert-notif-item">
              <Checkbox
                checked={activeNotif.emailEnabled}
                onChange={() => toggleNotif('emailEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_email', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_email_desc', props.locale)}</div>
            </div>
            <div className="alert-notif-item">
              <Checkbox
                checked={!!activeNotif.webhookUrl.trim()}
                onChange={(ck) => { if (!ck) updateNotif({ webhookUrl: '' }) }}
                label={<span className="alert-notif-label">{i18n('alert_notif_webhook', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_webhook_desc', props.locale)}</div>
              <div className="alert-notif-expander">
                <Input
                  className={`alert-webhook-url alert-webhook-url-${urlTone}`}
                  placeholder="https://example.com/alert-hook"
                  value={activeNotif.webhookUrl}
                  disabled={!activeNotif.webhookUrl.trim() && !activeNotif.webhookUrl}
                  onChange={v => updateNotif({ webhookUrl: String(v) })}/>
                {urlTone === 'invalid' && (
                  <div className="alert-webhook-validation alert-webhook-validation-invalid">
                    {i18n('alert_webhook_invalid', props.locale)}
                  </div>
                )}
              </div>
            </div>
            <div className="alert-notif-item">
              <Checkbox
                checked={activeNotif.soundEnabled}
                onChange={() => toggleNotif('soundEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_sound', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_sound_desc', props.locale)}</div>
              {activeNotif.soundEnabled && (
                <div className="alert-notif-expander alert-sound-selects">
                  <Dropdown
                    options={soundTitleOptions}
                    value={activeNotif.soundTitle}
                    onChange={v => updateNotif({ soundTitle: v as SoundTitle })}/>
                  <Dropdown
                    options={soundDurationOptions}
                    value={activeNotif.soundDuration}
                    onChange={v => updateNotif({ soundDuration: v as SoundDuration })}/>
                </div>
              )}
            </div>
            <div className="alert-notif-item">
              <Checkbox
                checked={activeNotif.plainTextEnabled}
                onChange={() => toggleNotif('plainTextEnabled')}
                label={<span className="alert-notif-label">{i18n('alert_notif_plaintext', props.locale)}</span>}/>
              <div className="alert-notif-desc">{i18n('alert_notif_plaintext_desc', props.locale)}</div>
              {activeNotif.plainTextEnabled && (
                <div className="alert-notif-expander">
                  <Input
                    className="alert-email-input"
                    placeholder="alternative@example.com"
                    value={activeNotif.plainTextEmail}
                    onChange={v => updateNotif({ plainTextEmail: String(v) })}/>
                </div>
              )}
            </div>
            <div className="alert-separator" />
            <div className="alert-notif-item">
              <div className="alert-notif-label">{i18n('alert_schedule', props.locale)}</div>
              <div className="alert-notif-expander">
                <Dropdown
                  block
                  options={scheduleOptions}
                  value={activeNotif.notificationSchedule.preset}
                  onChange={v => updateNotif({ notificationSchedule: { preset: v as NotificationSchedule['preset'] } })}/>
              </div>
              <div className="alert-notif-desc">{i18n('alert_schedule_desc', props.locale)}</div>
            </div>
          </div>
        ) : (
          <div className="alert-form">
            <fieldset className="alert-fieldset">
              <legend className="alert-legend">{i18n('alert_condition', props.locale)}</legend>
              {conditions.map((cond) => (
                <div key={cond.id} className="alert-condition-stack">
                  <Dropdown
                    block
                    className="alert-source-dropdown"
                    options={sourceOptions}
                    value={cond.source.type === 'price' ? 'price' : `ind:${cond.source.paneId}:${cond.source.name}:${cond.source.plot}`}
                    onChange={v => updateCondition(cond.id, { source: parseSourceValue(v) })}/>
                  <Dropdown
                    block
                    className="alert-operator-dropdown"
                    options={operatorOptions}
                    value={cond.operator}
                    onChange={v => updateCondition(cond.id, { operator: v as AlertOperator })}/>
                  <div className="alert-value-row">
                    <div className="alert-value-type">Value</div>
                    <Input
                      className="alert-value-input"
                      precision={8}
                      min={0}
                      placeholder={String(props.currentPrice ?? 0)}
                      value={cond.value}
                      onChange={v => updateCondition(cond.id, { value: parseFloat(String(v)) || 0 })}/>
                    {cond.operator === 'is_between' && (
                      <Input
                        className="alert-value-input alert-value-second"
                        precision={8}
                        min={0}
                        placeholder="\u2014"
                        value={cond.secondValue ?? 0}
                        onChange={v => updateCondition(cond.id, { secondValue: parseFloat(String(v)) || 0 })}/>
                    )}
                  </div>
                  {conditions.length > 1 && (
                    <button
                      className="alert-cond-remove"
                      onClick={() => removeCondition(cond.id)}
                      aria-label="Remove condition"
                      title="Remove">\u00d7</button>
                  )}
                </div>
              ))}
              <button className="alert-add-condition" onClick={addCondition}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7 1a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H8v4a1 1 0 1 1-2 0V8H2a1 1 0 1 1 0-2h4V2a1 1 0 0 1 1-1Z"/>
                </svg>
                {i18n('alert_add_condition', props.locale)}
              </button>
            </fieldset>

            <div className="alert-divider" />

            <fieldset className="alert-fieldset">
              <legend className="alert-legend">{i18n('alert_trigger', props.locale)}</legend>
              <Dropdown
                block
                options={triggerOptions}
                value={trigger}
                onChange={v => setTrigger(v as AlertFrequency)}/>
            </fieldset>

            <fieldset className="alert-fieldset">
              <legend className="alert-legend">{i18n('alert_expiration', props.locale)}</legend>
              <Dropdown
                block
                options={expirationOptions}
                value={expirationChoice}
                onChange={v => setExpirationChoice(v)}/>
            </fieldset>

            <fieldset className="alert-fieldset">
              <legend className="alert-legend">{i18n('alert_message', props.locale)}</legend>
              {messageExpanded ? (
                <>
                  <textarea
                    className="alert-message-textarea"
                    value={messageValue}
                    onChange={e => setMessage(e.target.value)}
                    rows={2}
                    spellCheck={false}
                    placeholder={defaultMessage}/>
                  <button className="alert-message-collapse" onClick={() => setMessageExpanded(false)}>
                    {i18n('alert_message_done', props.locale)}
                  </button>
                </>
              ) : (
                <button className="alert-summary-row" onClick={() => setMessageExpanded(true)}>
                  <span className="alert-summary-text">{messageValue}</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M3.92 7.83 9 12.29l5.08-4.46-1-1.13L9 10.29l-4.09-3.6-.99 1.14Z"/>
                  </svg>
                </button>
              )}
            </fieldset>

            <fieldset className="alert-fieldset">
              <legend className="alert-legend">{i18n('alert_notifications', props.locale)}</legend>
              <button className="alert-summary-row" onClick={enterNotifications}>
                <span className="alert-summary-text">{notifSummary}</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M3.92 7.83 9 12.29l5.08-4.46-1-1.13L9 10.29l-4.09-3.6-.99 1.14Z"/>
                </svg>
              </button>
            </fieldset>

            {validationError && (
              <div className="alert-validation-error" role="alert">
                {validationError}
              </div>
            )}
            {submitState === 'error' && (
              <button className="alert-retry-btn" onClick={handleSubmit}>
                {i18n('alert_retry', props.locale)}
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

function WebhookBadge({ status, httpStatus, at, locale }: { status: WebhookStatus; httpStatus?: number; at?: string; locale: string }) {
  const tone = status === 'delivered'
    ? { color: '#26A69A', label: i18n('alert_webhook_delivered', locale) }
    : status === 'failed'
      ? { color: '#EF5350', label: i18n('alert_webhook_failed', locale) }
      : { color: '#F89D3E', label: i18n('alert_webhook_sending', locale) }
  const title = `Webhook ${tone.label.toLowerCase()}${typeof httpStatus === 'number' ? ` \u00b7 HTTP ${httpStatus}` : ''}${at ? ` \u00b7 ${new Date(at).toLocaleString(locale)}` : ''}`
  return (
    <span className="alert-webhook-badge" title={title} style={{ color: tone.color }}>
      {tone.label}{typeof httpStatus === 'number' ? ` \u00b7 ${httpStatus}` : ''}
    </span>
  )
}

export { WebhookBadge }
export default AlertModal
