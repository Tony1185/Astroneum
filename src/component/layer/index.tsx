import { createContext, type ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'

interface LayerRecord { id: string; close: () => void }
interface LayerContextValue { register: (layer: LayerRecord) => () => void; closeTop: () => boolean; closeAll: () => void; getTrigger: () => Element | null }

const LayerContext = createContext<LayerContextValue | null>(null)

export function LayerProvider ({ children }: { children: ReactNode }) {
  const layers = useRef<LayerRecord[]>([])
  const lastTrigger = useRef<Element | null>(null)
  const [, setVersion] = useState(0)
  const register = useCallback((layer: LayerRecord) => {
    layers.current = [...layers.current.filter(item => item.id !== layer.id), layer]
    setVersion(value => value + 1)
    return () => { layers.current = layers.current.filter(item => item.id !== layer.id); setVersion(value => value + 1) }
  }, [])
  const closeTop = useCallback(() => {
    const layer = layers.current.at(-1)
    if (!layer) return false
    layer.close()
    return true
  }, [])
  const closeAll = useCallback(() => { for (const layer of [...layers.current].reverse()) layer.close() }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || !closeTop()) return
      event.preventDefault()
      event.stopPropagation()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [closeTop])
  useEffect(() => {
    const onPointerDown = (event: PointerEvent): void => { lastTrigger.current = event.target instanceof Element ? event.target : null }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [])
  const getTrigger = useCallback(() => {
    const active = document.activeElement
    return active instanceof HTMLElement && active !== document.body ? active : lastTrigger.current
  }, [])
  return <LayerContext.Provider value={{ register, closeTop, closeAll, getTrigger }}>{children}</LayerContext.Provider>
}

export function useLayerProvider (): LayerContextValue {
  const context = useContext(LayerContext)
  if (!context) throw new Error('useLayerProvider must be used inside LayerProvider')
  return context
}

export function useLayer (id: string, open: boolean, onClose: () => void): void {
  const context = useContext(LayerContext)
  const register = context?.register
  const getTrigger = context?.getTrigger
  const trigger = useRef<Element | null>(null)
  useLayoutEffect(() => {
    if (!open || !register) return
    trigger.current = getTrigger?.() ?? document.activeElement
    const unregister = register({ id, close: onClose })
    return () => {
      unregister()
      const element = trigger.current
      window.setTimeout(() => { if (element instanceof HTMLElement) element.focus() })
    }
  }, [getTrigger, id, onClose, open, register])
}
