'use client'

import './terminal.css'
import { type ReactNode, useState, useCallback, createContext, useContext } from 'react'

interface TerminalShellContextValue {
  sidebarOpen: boolean
  dockOpen: boolean
  toggleSidebar: () => void
  toggleDock: () => void
}

const TerminalShellContext = createContext<TerminalShellContextValue>({
  sidebarOpen: true,
  dockOpen: true,
  toggleSidebar: () => {},
  toggleDock: () => {},
})

export function useTerminalShell(): TerminalShellContextValue {
  return useContext(TerminalShellContext)
}

interface TerminalShellProps {
  children: ReactNode
  topbar?: ReactNode
  rail?: ReactNode
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
  rail,
  sidebar,
  dock,
  footer,
  theme = 'dark',
  defaultSidebarOpen = true,
  defaultDockOpen = true,
}: TerminalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen)
  const [dockOpen, setDockOpen] = useState(defaultDockOpen)

  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), [])
  const toggleDock = useCallback(() => setDockOpen(v => !v), [])

  const ctx: TerminalShellContextValue = { sidebarOpen, dockOpen, toggleSidebar, toggleDock }

  return (
    <TerminalShellContext.Provider value={ctx}>
      <div
        className="term-shell"
        data-theme={theme}
        data-sidebar={sidebarOpen ? 'open' : 'closed'}
        data-dock={dockOpen ? 'open' : 'closed'}
      >
        <div className="term-topbar">{topbar}</div>
        <div className="term-rail">{rail}</div>
        <div className="term-chart">{children}</div>
        <div className="term-sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>{sidebar}</div>
        <div className="term-dock">{dock}</div>
        <div className="term-footer">{footer}</div>
      </div>
    </TerminalShellContext.Provider>
  )
}
