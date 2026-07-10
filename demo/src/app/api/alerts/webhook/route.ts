import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side webhook relay for Astroneum alerts.
 *
 * Mirrors TradingView webhook semantics:
 *  - POST the alert message as the request body.
 *  - Content-Type auto-detected: application/json if the message parses as JSON,
 *    otherwise text/plain.
 *  - 3-second timeout (TV cancels if the remote takes >3s).
 *  - One retry on network error or HTTP >= 5xx.
 *
 * SSRF guard: blocks localhost / loopback / private / link-local / metadata
 * hosts. http and arbitrary ports are allowed on public hosts.
 *
 * Client (AlertManager._fire) POSTs { webhookUrl, message, payload } here to
 * bypass browser CORS restrictions on cross-origin POSTs.
 */

interface WebhookRequestBody {
  webhookUrl?: string
  message?: string
  payload?: Record<string, unknown>
}

const TIMEOUT_MS = 3000
const MAX_ATTEMPTS = 2

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return true
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|127\.)/.test(h)) return true
  if (h.endsWith('.local') || h.endsWith('.internal')) return true
  return false
}

function validateTargetUrl(raw: string): { ok: boolean; reason?: string } {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { ok: false, reason: 'Invalid URL' }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: 'Only http/https targets allowed' }
  }
  if (isPrivateHost(url.hostname)) {
    return { ok: false, reason: 'Private/localhost targets blocked (SSRF guard)' }
  }
  return { ok: true }
}

function pickContentType(message: string): string {
  try {
    JSON.parse(message)
    return 'application/json; charset=utf-8'
  } catch {
    return 'text/plain; charset=utf-8'
  }
}

export async function POST(req: NextRequest) {
  let body: WebhookRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { webhookUrl, message, payload } = body
  if (!webhookUrl || typeof webhookUrl !== 'string') {
    return NextResponse.json({ ok: false, error: 'webhookUrl required' }, { status: 400 })
  }

  const check = validateTargetUrl(webhookUrl)
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: check.reason }, { status: 400 })
  }

  const outBody = typeof message === 'string' && message.length > 0 ? message : JSON.stringify(payload ?? {})
  const contentType = pickContentType(outBody)

  let lastStatus: number | undefined
  let lastError: string | undefined

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'User-Agent': 'Astroneum-Alerts/1.0',
        },
        body: outBody,
        signal: controller.signal,
      })
      lastStatus = res.status
      console.log('[Alert Webhook]', {
        target: webhookUrl,
        status: res.status,
        attempt,
        contentType,
        ts: new Date().toISOString(),
      })
      clearTimeout(timer)
      if (res.status < 500) {
        const ok = res.status >= 200 && res.status < 300
        return NextResponse.json({ ok, status: res.status, attempt, contentType })
      }
    } catch (err) {
      clearTimeout(timer)
      lastError = err instanceof Error ? err.name : 'network_error'
      console.log('[Alert Webhook] error', {
        target: webhookUrl,
        error: lastError,
        attempt,
        ts: new Date().toISOString(),
      })
    }
  }

  return NextResponse.json(
    { ok: false, status: lastStatus, error: lastError ?? 'failed', attempts: MAX_ATTEMPTS },
    { status: 502 },
  )
}
