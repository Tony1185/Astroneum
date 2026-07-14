import { useEffect, useRef, useState } from 'react'

import { type Component } from '@/react-shared'

import { Modal, Input } from '@/component'
import { useLayer } from '@/component/layer'

import i18n from '@/i18n'

import { type SymbolInfo } from '@/types'

export interface SymbolSearchModalProps {
  locale: string
  searchSymbols: (query?: string) => Promise<SymbolInfo[]>
  onSymbolSelected: (symbol: SymbolInfo) => void
  onClose: () => void
}

const ASSET_TABS = ['all', 'stocks', 'funds', 'futures', 'forex', 'crypto', 'indices', 'bonds', 'economy', 'options'] as const
type AssetTab = typeof ASSET_TABS[number]

const TYPE_MAP: Record<string, AssetTab> = {
  stock: 'stocks', equity: 'stocks', common: 'stocks',
  fund: 'funds', etf: 'funds',
  futures: 'futures', future: 'futures',
  forex: 'forex', fx: 'forex',
  crypto: 'crypto',
  indices: 'indices', index: 'indices',
  bonds: 'bonds', bond: 'bonds',
  economy: 'economy',
  options: 'options', option: 'options',
}

function filterByTab (symbols: SymbolInfo[], tab: AssetTab): SymbolInfo[] {
  if (tab === 'all') return symbols
  return symbols.filter(s => TYPE_MAP[(s.type ?? '').toLowerCase()] === tab)
}

const SymbolSearchModal: Component<SymbolSearchModalProps> = props => {
  useLayer('symbol-search', true, props.onClose)
  const [value, setValue] = useState('')
  const [symbolList, setSymbolList] = useState<SymbolInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<AssetTab>('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const requestIdRef = useRef(0)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setLoading(true)
    debounceRef.current = setTimeout(() => {
      const thisRequestId = ++requestIdRef.current
      void props.searchSymbols(value)
        .then((list) => { if (requestIdRef.current === thisRequestId) { setSymbolList(list); setActiveIndex(0) } })
        .catch(() => { if (requestIdRef.current === thisRequestId) setSymbolList([]) })
        .finally(() => { if (requestIdRef.current === thisRequestId) setLoading(false) })
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, props.searchSymbols])

  const filtered = filterByTab(symbolList, activeTab)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const s = filtered[activeIndex]; if (s) { props.onSymbolSelected(s); props.onClose() } }
  }

  useEffect(() => {
    const el = resultsRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const activeRowId = filtered[activeIndex] ? `astroneum-symbol-search-row-${activeIndex}` : undefined

  return (
    <Modal title={i18n('symbol_search', props.locale)} width={840} onClose={props.onClose} initialFocus="body">
      <div className="astroneum-symbol-search-modal" onKeyDown={handleKeyDown}>
        <Input
          className="astroneum-symbol-search-modal-input"
          placeholder={i18n('symbol_code', props.locale)}
          role="searchbox"
          ariaLabel={i18n('symbol_search', props.locale)}
          autoFocus
          prefix={<svg viewBox="0 0 1024 1024"><path d="M945.066667 898.133333l-189.866667-189.866666c55.466667-64 87.466667-149.333333 87.466667-241.066667 0-204.8-168.533333-373.333333-373.333334-373.333333S96 264.533333 96 469.333333 264.533333 842.666667 469.333333 842.666667c91.733333 0 174.933333-34.133333 241.066667-87.466667l189.866667 189.866667c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c8.533333-12.8 8.533333-34.133333-2.133333-46.933334zM469.333333 778.666667C298.666667 778.666667 160 640 160 469.333333S298.666667 160 469.333333 160 778.666667 298.666667 778.666667 469.333333 640 778.666667 469.333333 778.666667z"/></svg>}
          suffix={value ? (
            <button
              type="button"
              className="astroneum-symbol-search-modal-clear"
              aria-label={i18n('symbol_search_clear', props.locale)}
              onClick={() => setValue('')}>
              <svg viewBox="0 0 1024 1024"><path d="M512 421.5 331.5 241 241 331.5 421.5 512 241 692.5 331.5 783 512 602.5 692.5 783 783 692.5 602.5 512 783 331.5 692.5 241z"/></svg>
            </button>
          ) : undefined}
          value={value}
          onChange={v => setValue(`${v}`)}
        />
        <div className="astroneum-symbol-search-modal-tabs" role="tablist" aria-label={i18n('symbol_search', props.locale)}>
          {ASSET_TABS.map(tab => (
            <button key={tab} role="tab" aria-selected={activeTab === tab} className={`astroneum-symbol-search-modal-tab${activeTab === tab ? ' is-active' : ''}`} onClick={() => { setActiveTab(tab); setActiveIndex(0) }}>
              {i18n(`symbol_search_${tab}`, props.locale)}
            </button>
          ))}
          <button
            role="tab"
            aria-selected={false}
            aria-disabled="true"
            disabled
            title={i18n('symbol_search_more', props.locale)}
            className="astroneum-symbol-search-modal-tab is-disabled">
            {i18n('symbol_search_more', props.locale)}
          </button>
        </div>
        <div
          ref={el => { resultsRef.current = el }}
          className="astroneum-symbol-search-modal-results"
          role="listbox"
          aria-activedescendant={activeRowId}>
          {loading && <div className="astroneum-symbol-search-modal-message">{i18n('symbol_search_loading', props.locale)}</div>}
          {!loading && filtered.length === 0 && <div className="astroneum-symbol-search-modal-empty">{i18n('symbol_search_no_results', props.locale)}</div>}
          {!loading && filtered.map((symbol, index) => (
            <div
              key={`${symbol.ticker}-${index}`}
              id={`astroneum-symbol-search-row-${index}`}
              data-index={index}
              data-name="symbol-search-dialog-content-item"
              role="option"
              aria-selected={index === activeIndex}
              className={`astroneum-symbol-search-modal-row${index === activeIndex ? ' is-active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => { props.onSymbolSelected(symbol); props.onClose() }}
            >
              <div className="astroneum-symbol-search-modal-cell-ticker">
                {symbol.logo && <img alt="" src={symbol.logo} />}
                <span className="astroneum-symbol-search-modal-ticker">{symbol.shortName ?? symbol.ticker}</span>
              </div>
              <div className="astroneum-symbol-search-modal-cell-desc">{symbol.name ?? ''}</div>
              <div className="astroneum-symbol-search-modal-cell-exchange">{symbol.exchange ?? ''}</div>
              <div className="astroneum-symbol-search-modal-cell-actions" />
            </div>
          ))}
        </div>
        <div className="astroneum-symbol-search-modal-footer">{i18n('symbol_search_footer', props.locale)}</div>
      </div>
    </Modal>
  )
}

export default SymbolSearchModal
