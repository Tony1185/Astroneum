import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

interface LayerRecord {
  id: string
  close: () => void
}

interface LayerContextValue {
  register: (layer: LayerRecord) => () => void
  closeTop: () => boolean
  closeAll: () => void
}

const LayerContext = createContext<LayerContextValue | null>(null)

export function LayerProvider ({ children }: { children: ReactNode }) {
  const layers = useRef<LayerRecord[]>([])
  const [, setVersion] = useState(0)

  const register = useCallback((layer: LayerRecord) => {
    layers.current = [...layers.current.filter(item => item.id !== layer.id), layer]
    setVersion(version => version + 1)
    return () => {
      layers.current = layers.current.filter(item => item.id !== layer.id)
      setVersion(version => version + 1)
    }
  }, [])

  const closeTop = useCallback(() => {
    const layer = layers.current.at(-1)
    if (!layer) return false
    layer.close()
    return true
  }, [])

  const closeAll = useCallback(() => {
    for (const layer of [...layers.current].reverse()) layer.close()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || !closeTop()) return
      event.preventDefault()
      event.stopPropagation()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [closeTop])

  return <LayerContext.Provider value={{ register, closeTop, closeAll }}>{children}</LayerContext.Provider>
}

export function useLayerProvider (): LayerContextValue {
  const context = useContext(LayerContext)
  if (!context) throw new Error('useLayerProvider must be used inside LayerProvider')
  return context
}

export function useLayer (id: string, open: boolean, onClose: () => void): void {
  const { register } = useLayerProvider()
  const trigger = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return
    trigger.current = document.activeElement
    return register({ id, close: onClose })
  }, [id, onClose, open, register])

  useEffect(() => {
    if (open || !(trigger.current instanceof HTMLElement)) return
    trigger.current.focus()
  }, [open])
}
