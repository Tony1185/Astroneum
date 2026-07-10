import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, subject, body, isPlainText } = await req.json()
    // Stub: log the email payload. Wire to real SMTP (Nodemailer, etc.) here.
    console.log('[Alert Email]', { email, subject, body, isPlainText, timestamp: new Date().toISOString() })
    return NextResponse.json({ ok: true, message: 'Email queued (stub — wire to SMTP in production)' })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}
