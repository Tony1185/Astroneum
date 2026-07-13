import { useEffect, useRef } from 'react'

import { type ParentComponent, type ParentProps, type JSX } from '@/react-shared'

import Button, { type ButtonProps } from '../button'

export interface ModalProps extends ParentProps {
  width?: number
  title?: JSX.Element
  buttons?: ButtonProps[]
  onClose?: () => void
  className?: string
  /** 'body' focuses the first focusable element inside modal-card-body (e.g. a search input) instead of the header close button. Defaults to 'first'. */
  initialFocus?: 'first' | 'body'
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

let _modalIdCounter = 0

const Modal: ParentComponent<ModalProps> = (props) => {
  const titleId = `astroneum-modal-title-${++_modalIdCounter}`
  const cardRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLElement | null>(null)
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    triggerRef.current = document.activeElement

    const onKeyDown = (keyboardEvent: KeyboardEvent): void => {
      if (keyboardEvent.key === 'Escape') {
        props.onClose?.()
        return
      }
      if (keyboardEvent.key === 'Tab' && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (keyboardEvent.shiftKey) {
          if (document.activeElement === first) { keyboardEvent.preventDefault(); last?.focus() }
        } else {
          if (document.activeElement === last) { keyboardEvent.preventDefault(); first?.focus() }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)

    const focusRoot = props.initialFocus === 'body' ? bodyRef.current : cardRef.current
    const target = focusRoot?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    target?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const trigger = triggerRef.current
      if (trigger instanceof HTMLElement) trigger.focus()
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="astroneum-modal modal is-active">
      <div
        className="modal-background"
        onClick={props.onClose}/>
      <div
        ref={el => { cardRef.current = el }}
        style={{ width: `${props.width ?? 400}px`, maxWidth: 'calc(100vw - 32px)' }}
        className={`modal-card ${props.className ?? ''}`}>
        <header
          className="modal-card-head">
          <p id={titleId} className="modal-card-title">{props.title}</p>
          <button
            className="delete"
            aria-label="close"
            onClick={props.onClose}/>
        </header>
        <section
          ref={el => { bodyRef.current = el }}
          className="modal-card-body">
          {props.children}
        </section>
        {
          (props.buttons && props.buttons.length > 0) && (
            <footer
              className="modal-card-foot">
              {
                props.buttons.map((button, index) => {
                  return (
                    <Button key={`modal-button-${index}`} {...button}>
                      {button.children}
                    </Button>
                  )
                })
              }
            </footer>
          )
        }
      </div>
    </div>
  )
}

export default Modal
