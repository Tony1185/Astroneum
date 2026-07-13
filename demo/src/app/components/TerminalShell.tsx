'use client'

import './terminal.css'
import { type CSSProperties, type ReactNode, useState, useCallback, useEffect, createContext, useContext } from 'react'

interface TerminalShellContextValue {
  sidebarOpen: boolean
  sidebarWidth: number
  dockOpen: boolean
  dockMaximized: boolean
  dockHeight: number
  surface: 'none' | 'curtain' | 'split'
  surfaceTitle: string
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  toggleDock: () => void
  toggleDockMaximized: () => void
  setDockHeight: (height: number) => void
  openCurtain: (title: string) => void
  moveSurfaceToSplit: () => void
  closeSurface: () => void
}

const SIDEBAR_MIN_WIDTH = 280
const SIDEBAR_MAX_WIDTH = 540
const SIDEBAR_DEFAULT_WIDTH = 320

const TerminalShellContext = createContext<TerminalShellContextValue>({
  sidebarOpen: true,
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
  dockOpen: true,
  dockMaximized: false,
  dockHeight: 220,
  surface: 'none',
  surfaceTitle: '',
  toggleSidebar: () => {},
  setSidebarWidth: () => {},
  toggleDock: () => {},
  toggleDockMaximized: () => {},
  setDockHeight: () => {},
  openCurtain: () => {},
  moveSurfaceToSplit: () => {},
  closeSurface: () => {},
})

export function useTerminalShell(): TerminalShellContextValue {
  return useContext(TerminalShellContext)
}

interface TerminalShellProps {
  children: ReactNode
  topbar?: ReactNode
  sidebar?: ReactNode
  dock?: ReactNode
  footer?: ReactNode
  theme?: 'dark' | 'light' | 'high-contrast'
  defaultSidebarOpen?: boolean
  defaultDockOpen?: boolean
}

export default function TerminalShell({
  children,
  topbar,
  sidebar,
  dock,
  footer,
  theme = 'dark',
  defaultSidebarOpen = true,
  defaultDockOpen = true,
}: TerminalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen)
  const [sidebarWidth, setSidebarWidthState] = useState(SIDEBAR_DEFAULT_WIDTH)
  const [dockOpen, setDockOpen] = useState(defaultDockOpen)
  const [dockMaximized, setDockMaximized] = useState(false)
  const [dockHeight, setDockHeight] = useState(220)
  const [surface, setSurface] = useState<TerminalShellContextValue['surface']>('none')
  const [surfaceTitle, setSurfaceTitle] = useState('')

  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), [])
  const setSidebarWidth = useCallback((width: number) => {
    setSidebarWidthState(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width)))
  }, [])
  const toggleDock = useCallback(() => {
    setDockOpen(v => !v)
    setDockMaximized(false)
  }, [])
  const toggleDockMaximized = useCallback(() => {
    setDockOpen(true)
    setDockMaximized(v => !v)
  }, [])
  const openCurtain = useCallback((title: string) => {
    setSurfaceTitle(title)
    setSurface('curtain')
  }, [])
  const moveSurfaceToSplit = useCallback(() => setSurface('split'), [])
  const closeSurface = useCallback(() => setSurface('none'), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && surface !== 'none') {
        event.preventDefault()
        closeSurface()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeSurface, surface])

  const ctx: TerminalShellContextValue = {
    sidebarOpen, sidebarWidth, dockOpen, dockMaximized, dockHeight, surface, surfaceTitle,
    toggleSidebar, setSidebarWidth, toggleDock, toggleDockMaximized, setDockHeight, openCurtain, moveSurfaceToSplit, closeSurface,
  }

  const onSidebarResizeStart = useCallback((event: React.PointerEvent) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = sidebarWidth
    const onMove = (moveEvent: PointerEvent) => {
      setSidebarWidth(startWidth - (moveEvent.clientX - startX))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [sidebarWidth, setSidebarWidth])

  return (
    <TerminalShellContext.Provider value={ctx}>
      <div
        className="term-shell"
        data-theme={theme}
        data-sidebar={sidebarOpen ? 'open' : 'closed'}
        data-dock={dockOpen ? 'open' : 'closed'}
        data-dock-maximized={dockMaximized}
        style={{
          ...(dockOpen ? { '--term-dock-h': `${dockHeight}px` } : {}),
          ...(sidebarOpen ? { '--term-sidebar-w': `${sidebarWidth}px` } : {}),
        } as CSSProperties}
      >
        <div className="term-topbar">{topbar}</div>
        <div className="term-workspace">
          <div className="term-workspace-main">
            <div className="term-chart">{children}</div>
            <div className="term-dock">{dock}</div>
          </div>
        </div>
        <aside className="term-sidebar" aria-label="Chart sidebar">
          {sidebarOpen && (
            <div
              className="term-sidebar-resize-handle"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize sidebar"
              onPointerDown={onSidebarResizeStart}
            />
          )}
          {sidebar}
        </aside>
        <div className="term-footer">{footer}</div>
        {surface === 'split' && (
          <section className="term-split-view" aria-label={`${surfaceTitle} split view`}>
            <header className="term-surface-header">
              <strong>{surfaceTitle}</strong>
              <button className="term-icon-btn" onClick={closeSurface} aria-label={`Close ${surfaceTitle}`}>×</button>
            </header>
            <div className="term-surface-empty">This product is open beside the chart. Connect a data source to populate it.</div>
          </section>
        )}
        {surface === 'curtain' && (
          <div className="term-curtain-backdrop" role="presentation" onMouseDown={closeSurface}>
            <section className="term-curtain" role="dialog" aria-modal="true" aria-label={surfaceTitle} onMouseDown={event => event.stopPropagation()}>
              <header className="term-surface-header">
                <strong>{surfaceTitle}</strong>
                <div className="term-surface-actions">
                  <button className="term-btn" onClick={moveSurfaceToSplit}>Move to split view</button>
                  <button className="term-icon-btn" onClick={closeSurface} aria-label={`Close ${surfaceTitle}`}>×</button>
                </div>
              </header>
              <div className="term-surface-empty">This surface preserves chart state. Its connected data experience is available when configured.</div>
            </section>
          </div>
        )}
      </div>
    </TerminalShellContext.Provider>
  )
}
