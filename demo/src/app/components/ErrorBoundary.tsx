'use client'

import React from 'react'

interface State {
  hasError: boolean
  error: Error | null
  errors: string[]
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null, errors: [] }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errors: [] }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  componentDidMount(): void {
    window.addEventListener('error', (e: ErrorEvent) => {
      const msg = `ERROR: ${e.message} at ${e.filename}:${e.lineno}:${e.colno}\n${e.error?.stack ?? ''}`
      console.error('[window.onerror]', msg)
      this.setState(prev => ({ errors: [...prev.errors, msg] }))
    })
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      const msg = `UNHANDLED REJECTION: ${String(e.reason)}\n${e.reason?.stack ?? ''}`
      console.error('[unhandledrejection]', msg)
      this.setState(prev => ({ errors: [...prev.errors, msg] }))
    })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 24, fontFamily: 'monospace', fontSize: 14,
          color: '#f85149', background: '#0d0e12',
          height: '100dvh', overflow: 'auto', whiteSpace: 'pre-wrap',
        }}>
          <h2 style={{ color: '#f85149', marginBottom: 16 }}>Chart render error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return (
      <>
        {this.state.errors.length > 0 && (
          <div style={{
            position: 'fixed', top: 0, right: 0, zIndex: 9999,
            padding: 12, fontFamily: 'monospace', fontSize: 12,
            color: '#f85149', background: 'rgba(13,14,18,0.95)',
            border: '1px solid #f85149', borderRadius: 6,
            maxWidth: 600, maxHeight: '50vh', overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {this.state.errors.length} JS error(s) detected:
            </div>
            {this.state.errors.map((e, i) => (
              <div key={i} style={{ marginBottom: 8, borderBottom: '1px solid #30363d', paddingBottom: 4 }}>
                {e}
              </div>
            ))}
          </div>
        )}
        {this.props.children}
      </>
    )
  }
}
