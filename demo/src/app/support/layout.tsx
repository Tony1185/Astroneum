import './support.css'
import Breadcrumb from './_components/Breadcrumb'

export const metadata = {
  title: {
    default: 'Alerts Help — Astroneum',
    template: '%s — Astroneum',
  },
  description: 'TradingView alerts help center, mirrored to Astroneum.',
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="support-shell">
      <header className="support-header">
        <div className="support-header-inner">
          <a href="/astroneum/" className="support-back">← Astroneum</a>
          <span className="support-header-title">Alerts Help Center</span>
        </div>
      </header>
      <main className="support-main">
        <Breadcrumb />
        {children}
      </main>
    </div>
  )
}
