/**
 * Client-side price / indicator alerts engine — extended.
 *
 * Alerts are persisted to localStorage and evaluated on every new bar
 * or price tick via `AlertManager.check()`.
 *
 * Extended fields: expiration, messageTemplate, emailEnabled,
 * plainTextEnabled, plainTextEmail, toastEnabled, notificationSchedule,
 * soundTitle, soundDuration.
 *
 * Delivery: sound (variable titles), browser notification, toast popup,
 * webhook (via server-side relay /astroneum/api/alerts/webhook), email
 * (via API route), plain-text email, schedule gate. Webhook delivery status
 * is written back onto the alert so the alert log can surface it
 * (mirrors TradingView's "Webhook status" column).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AlertCondition = 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'crossing'
export type AlertStatus = 'active' | 'triggered' | 'expired' | 'dismissed'
export type AlertFrequency = 'once' | 'every_bar' | 'bar_close'
export type SoundTitle = 'Thin' | 'Classic' | 'Alert' | 'Bell' | 'Chime'
export type SoundDuration = 'once' | 'repeating'
export type WebhookStatus = 'pending' | 'delivered' | 'failed'

export interface NotificationSchedule {
  preset: '24/7' | 'weekdays' | 'working_hours' | 'custom'
  days?: number[]
  from?: string
  to?: string
}

export interface Alert {
  id: string
  symbol: string
  condition: AlertCondition
  price: number
  note?: string
  timeframe?: string
  frequency: AlertFrequency
  status: AlertStatus
  createdAt: string
  triggeredAt?: string
  soundEnabled: boolean
  notificationEnabled: boolean
  webhookUrl?: string
  webhookStatus?: WebhookStatus
  webhookStatusAt?: string
  webhookHttpStatus?: number
  expiration?: string
  messageTemplate?: string
  emailEnabled?: boolean
  plainTextEnabled?: boolean
  plainTextEmail?: string
  toastEnabled?: boolean
  notificationSchedule?: NotificationSchedule
  soundTitle?: SoundTitle
  soundDuration?: SoundDuration
}

export type AlertCreate = Omit<Alert, 'id' | 'status' | 'createdAt' | 'triggeredAt'> &
  Partial<Pick<Alert, 'frequency' | 'soundEnabled' | 'notificationEnabled'>>

export interface AlertCheckInput {
  symbol: string
  price: number
  timestamp: number
}

export type AlertTriggeredCallback = (alert: Alert, price: number) => void

function isValidWebhookUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|127\.)/.test(host)) return false
    if (host.endsWith('.local') || host.endsWith('.internal')) return false
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'astroneum-alerts'

function loadFromStorage(): Alert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((a: unknown) => {
      if (a === null || typeof a !== 'object') return false
      const obj = a as Record<string, unknown>
      return typeof obj.id === 'string' &&
        typeof obj.symbol === 'string' &&
        typeof obj.price === 'number' &&
        typeof obj.status === 'string' &&
        typeof obj.createdAt === 'string'
    }) as Alert[]
  } catch {
    return []
  }
}

function saveToStorage(alerts: Alert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  } catch { /* quota */ }
}

// ---------------------------------------------------------------------------
// Sound — variable titles via AudioContext
// ---------------------------------------------------------------------------

const SOUND_FREQS: Record<SoundTitle, number> = {
  Thin: 880,
  Classic: 660,
  Alert: 1000,
  Bell: 523,
  Chime: 784,
}

function playBeep(title: SoundTitle = 'Thin', duration: SoundDuration = 'once'): void {
  try {
    const ctx = new AudioContext()
    const freq = SOUND_FREQS[title] ?? 880
    const playOnce = () => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
      osc.onended = () => { if (duration !== 'repeating') void ctx.close() }
    }
    playOnce()
    if (duration === 'repeating') {
      const interval = setInterval(playOnce, 600)
      setTimeout(() => { clearInterval(interval); void ctx.close() }, 5000)
    }
  } catch { /* SSR */ }
}

// ---------------------------------------------------------------------------
// Toast — DOM-based popup
// ---------------------------------------------------------------------------

let toastContainer: HTMLDivElement | null = null

function getToastContainer(): HTMLDivElement {
  if (toastContainer && document.body.contains(toastContainer)) return toastContainer
  toastContainer = document.createElement('div')
  toastContainer.id = 'astroneum-alert-toast-container'
  toastContainer.style.cssText =
    'position:fixed;top:16px;right:16px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none'
  document.body.appendChild(toastContainer)
  return toastContainer
}

function showToast(title: string, body: string): void {
  try {
    const container = getToastContainer()
    const toast = document.createElement('div')
    toast.style.cssText =
      'pointer-events:auto;min-width:280px;max-width:400px;padding:12px 16px;border-radius:8px;' +
      'background:#1d2026;border:1px solid #2962ff;color:#d1d4dc;font-family:-apple-system,sans-serif;' +
      'font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,0.4);cursor:pointer;transition:opacity 0.3s;' +
      'animation:toast-in 0.2s ease-out'
    const titleEl = document.createElement('div')
    titleEl.textContent = title
    titleEl.style.cssText = 'font-weight:600;margin-bottom:4px;color:#2962ff'
    const bodyEl = document.createElement('div')
    bodyEl.textContent = body
    bodyEl.style.cssText = 'color:#8a8f9c;font-size:13px'
    toast.appendChild(titleEl)
    toast.appendChild(bodyEl)
    toast.onclick = () => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }
    container.appendChild(toast)
    setTimeout(() => {
      if (toast.parentNode) { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }
    }, 8000)
  } catch { /* SSR */ }
}

// ---------------------------------------------------------------------------
// Schedule — check if current time is within the active schedule
// ---------------------------------------------------------------------------

function isWithinSchedule(schedule: NotificationSchedule | undefined): boolean {
  if (!schedule || schedule.preset === '24/7') return true
  const now = new Date()
  const day = now.getDay()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`

  if (schedule.preset === 'weekdays') {
    return day >= 1 && day <= 5
  }
  if (schedule.preset === 'working_hours') {
    return day >= 1 && day <= 5 && timeStr >= '09:00' && timeStr <= '18:00'
  }
  if (schedule.preset === 'custom') {
    const days = schedule.days ?? [0, 1, 2, 3, 4, 5, 6]
    if (!days.includes(day)) return false
    const from = schedule.from ?? '00:00'
    const to = schedule.to ?? '23:59'
    if (from <= to) {
      return timeStr >= from && timeStr <= to
    }
    return timeStr >= from || timeStr <= to
  }
  return true
}

// ---------------------------------------------------------------------------
// Email — POST to server-side API route
// ---------------------------------------------------------------------------

async function sendAlertEmail(
  email: string,
  subject: string,
  body: string,
  isPlainText: boolean,
): Promise<void> {
  try {
    await fetch('/astroneum/api/alerts/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subject, body, isPlainText }),
    })
  } catch { /* best-effort */ }
}

// ---------------------------------------------------------------------------
// Webhook — relay through server-side API route
// ---------------------------------------------------------------------------

interface WebhookRelayResponse {
  ok?: boolean
  status?: number
  attempt?: number
  error?: string
  contentType?: string
}

async function sendAlertWebhook(
  webhookUrl: string,
  messageBody: string,
  payload: Record<string, unknown>,
  onStatus: (patch: { webhookStatus: WebhookStatus; webhookStatusAt: string; webhookHttpStatus?: number }) => void,
): Promise<void> {
  try {
    onStatus({ webhookStatus: 'pending', webhookStatusAt: new Date().toISOString() })
    const res = await fetch('/astroneum/api/alerts/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl, message: messageBody, payload }),
    })
    const data = (await res.json()) as WebhookRelayResponse
    onStatus({
      webhookStatus: data?.ok ? 'delivered' : 'failed',
      webhookStatusAt: new Date().toISOString(),
      webhookHttpStatus: typeof data?.status === 'number' ? data.status : undefined,
    })
  } catch {
    onStatus({ webhookStatus: 'failed', webhookStatusAt: new Date().toISOString() })
  }
}

// ---------------------------------------------------------------------------
// AlertManager singleton
// ---------------------------------------------------------------------------

export class AlertManager {
  private static _instance: AlertManager | null = null
  private _alerts: Alert[]
  private _lastPrice: Map<string, number> = new Map()
  private _listeners: AlertTriggeredCallback[] = []
  private _savePending = false

  private constructor() {
    this._alerts = loadFromStorage()
  }

  static getInstance(): AlertManager {
    if (!AlertManager._instance) {
      AlertManager._instance = new AlertManager()
    }
    return AlertManager._instance
  }

  add(create: AlertCreate): string {
    const alert: Alert = {
      ...create,
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      frequency: create.frequency ?? 'once',
      soundEnabled: create.soundEnabled ?? true,
      notificationEnabled: create.notificationEnabled ?? false,
    }
    this._alerts.push(alert)
    saveToStorage(this._alerts)
    return alert.id
  }

  update(id: string, patch: Partial<Omit<Alert, 'id' | 'createdAt'>>): boolean {
    const idx = this._alerts.findIndex(a => a.id === id)
    if (idx === -1) return false
    this._alerts[idx] = { ...this._alerts[idx], ...patch }
    saveToStorage(this._alerts)
    return true
  }

  delete(id: string): boolean {
    const prev = this._alerts.length
    this._alerts = this._alerts.filter(a => a.id !== id)
    if (this._alerts.length !== prev) { saveToStorage(this._alerts); return true }
    return false
  }

  dismiss(id: string): boolean { return this.update(id, { status: 'dismissed' }) }
  reactivate(id: string): boolean { return this.update(id, { status: 'active', triggeredAt: undefined }) }
  clear(symbol?: string): void {
    this._alerts = symbol ? this._alerts.filter(a => a.symbol !== symbol) : []
    saveToStorage(this._alerts)
  }

  getAll(): readonly Alert[] { return this._alerts }
  getActive(): Alert[] { return this._alerts.filter(a => a.status === 'active') }
  getForSymbol(symbol: string): Alert[] { return this._alerts.filter(a => a.symbol === symbol) }
  getActiveForSymbol(symbol: string): Alert[] {
    return this._alerts.filter(a => a.symbol === symbol && a.status === 'active')
  }
  getHistory(): Alert[] { return this._alerts.filter(a => a.status !== 'active') }

  /**
   * Call on every price tick or bar close.
   * Checks expiration, evaluates conditions, fires delivery.
   */
  check(input: AlertCheckInput): void {
    const { symbol, price, timestamp } = input
    const last = this._lastPrice.get(symbol)
    this._lastPrice.set(symbol, price)

    for (const alert of this._alerts) {
      if (alert.symbol !== symbol || alert.status !== 'active') continue

      // Expiration check
      if (alert.expiration && new Date(alert.expiration).getTime() < timestamp) {
        alert.status = 'expired'
        continue
      }

      let triggered = false
      switch (alert.condition) {
        case 'above': triggered = price >= alert.price; break
        case 'below': triggered = price <= alert.price; break
        case 'crosses_above':
          triggered = last !== undefined && last < alert.price && price >= alert.price; break
        case 'crosses_below':
          triggered = last !== undefined && last > alert.price && price <= alert.price; break
        case 'crossing':
          triggered = last !== undefined && (
            (last < alert.price && price >= alert.price) ||
            (last > alert.price && price <= alert.price)
          ); break
      }

      if (!triggered) continue

      const triggeredAt = new Date(timestamp).toISOString()
      alert.triggeredAt = triggeredAt
      if (alert.frequency === 'once') { alert.status = 'triggered' }

      this._fire(alert, price)
    }

    this._schedulePersist()
  }

  private _schedulePersist(): void {
    if (this._savePending) return
    this._savePending = true
    setTimeout(() => { this._savePending = false; saveToStorage(this._alerts) }, 1000)
  }

  private _fire(alert: Alert, price: number): void {
    const inSchedule = isWithinSchedule(alert.notificationSchedule)
    const label = alert.messageTemplate ?? alert.note ?? `${alert.symbol} ${alert.condition} ${alert.price}`
    const body = `${alert.symbol} ${alert.condition} ${alert.price} — current: ${price}`

    // Sound
    if (alert.soundEnabled && inSchedule) {
      playBeep(alert.soundTitle ?? 'Thin', alert.soundDuration ?? 'once')
    }

    // Browser notification
    if (alert.notificationEnabled && inSchedule && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Alert: ${label}`, { body: `Current price: ${price}`, icon: '/favicon.ico' })
      } else if (Notification.permission !== 'denied') {
        void Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            new Notification(`Alert: ${label}`, { body: `Current price: ${price}` })
          }
        })
      }
    }

    // Toast
    if (alert.toastEnabled && inSchedule) {
      showToast(`Alert: ${label}`, body)
    }

    // Webhook — relay through server-side route (bypasses CORS, mirrors TV)
    if (alert.webhookUrl && isValidWebhookUrl(alert.webhookUrl) && inSchedule) {
      const messageBody = alert.messageTemplate ?? body
      const payload = {
        id: alert.id, symbol: alert.symbol, condition: alert.condition,
        price: alert.price, triggeredPrice: price, triggeredAt: alert.triggeredAt,
        note: alert.note, message: messageBody,
      }
      void sendAlertWebhook(alert.webhookUrl, messageBody, payload, (patch) => {
        this.update(alert.id, patch)
      })
    }

    // Email
    if (alert.emailEnabled && inSchedule) {
      void sendAlertEmail('', `Alert: ${label}`, body, false)
    }

    // Plain text email
    if (alert.plainTextEnabled && alert.plainTextEmail && inSchedule) {
      void sendAlertEmail(alert.plainTextEmail, `Alert: ${label}`, body, true)
    }

    // Registered callbacks
    for (const cb of this._listeners) {
      try { cb(alert, price) } catch {}
    }
  }

  onTriggered(cb: AlertTriggeredCallback): () => void {
    this._listeners.push(cb)
    return () => { this._listeners = this._listeners.filter(l => l !== cb) }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied'
    if (Notification.permission !== 'default') return Notification.permission
    return Notification.requestPermission()
  }
}

export default AlertManager
