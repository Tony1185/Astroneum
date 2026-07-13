import { useState } from 'react'

import { type JSX, type Component } from '@/react-shared'

export interface InputProps {
  className?: string
  style?: JSX.CSSProperties
  prefix?: JSX.Element
  suffix?: JSX.Element
  precision?: number
  min?: number
  max?: number
  placeholder?: string
  value: string | number
  disabled?: boolean
  onChange?: (value: string | number) => void
  id?: string
  name?: string
  role?: string
  ariaLabel?: string
  autoFocus?: boolean
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  inputRef?: (el: HTMLInputElement | null) => void
}

const Input: Component<InputProps> = p => {
  const props = { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER, ...p }
  let input: HTMLInputElement | null = null

  const [status, setStatus] = useState('normal')

  return (
    <div
      style={props.style}
      className={`astroneum-input control ${props.prefix ? 'has-icons-left' : ''} ${props.suffix ? 'has-icons-right' : ''} ${props.className ?? ''}`}
      data-status={status}
      onClick={() => { input?.focus() }}>
      <input
        ref={(el) => { input = el; props.inputRef?.(el) }}
        className="input is-small"
        placeholder={props.placeholder ?? ''}
        value={props.value}
        id={props.id}
        name={props.name}
        role={props.role}
        aria-label={props.ariaLabel}
        autoFocus={props.autoFocus}
        disabled={props.disabled}
        onKeyDown={props.onKeyDown}
        onFocus={() => { setStatus('focus') }}
        onBlur={() => { setStatus('normal') }}
        onChange={(changeEvent) => {
          const inputValue = (changeEvent.target).value
          if ('precision' in props) {
            let validationRegex
            const decimalDigit = Math.max(0, Math.floor(props.precision!))
            if (decimalDigit <= 0) {
              validationRegex = new RegExp(/^[1-9]\d*$/)
            } else {
              validationRegex = new RegExp('^\\d+\\.?\\d{0,' + decimalDigit + '}$')
            }
            if (inputValue === '' || (validationRegex.test(inputValue) && +inputValue >= props.min && +inputValue <= props.max)) {
              props.onChange?.(inputValue === '' ? inputValue : +inputValue)
            }
          } else {
            props.onChange?.(inputValue)
          }
        }}/>
      {props.prefix && <span className="icon is-small is-left">{props.prefix}</span>}
      {props.suffix && <span className="icon is-small is-right">{props.suffix}</span>}
    </div>
  )
}

export default Input
