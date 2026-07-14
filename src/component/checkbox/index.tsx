import { useEffect, useState } from 'react'

import { type Component, type JSX } from '@/react-shared'

export interface CheckboxProps {
  className?: string
  style?: JSX.CSSProperties | string
  checked?: boolean
  disabled?: boolean
  label?: JSX.Element
  onChange?: (checked: boolean) => void
}

const Checkbox: Component<CheckboxProps> = props => {
  const [innerChecked, setInnerChecked] = useState(props.checked ?? false)

  useEffect(() => {
    if (props.checked !== undefined) {
      setInnerChecked(props.checked)
    }
  }, [props.checked])

  return (
    <label
      style={props.style}
      className={`astroneum-checkbox ${(innerChecked && 'checked') || ''} ${props.disabled ? 'is-disabled' : ''} ${props.className || ''}`}>
      <input
        type="checkbox"
        checked={innerChecked}
        disabled={props.disabled}
        onChange={e => {
          const ck = e.target.checked
          if (props.onChange) { props.onChange(ck) }
          setInnerChecked(ck)
        }}
      />
      <span className="checkbox-visual">
        {innerChecked && (
          <svg viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {props.label && <span className="label">{props.label}</span>}
    </label>
  )
}

export default Checkbox
