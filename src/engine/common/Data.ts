import type Nullable from './Nullable'

export interface NeighborData<D> {
  prev: D
  current: D
  next: D
}

export type Timestamp = number

export interface CandleData {
  timestamp: Timestamp
  open: number
  high: number
  low: number
  close: number
  volume?: number
  turnover?: number
  [key: string]: unknown
}

const REQUIRED_NUMBER_FIELDS = ['open', 'high', 'low', 'close'] as const
const OPTIONAL_NUMBER_FIELDS = ['volume', 'turnover'] as const

export function cloneValidatedBar (data: CandleData, context = 'bar'): CandleData {
  if (data === null || typeof data !== 'object') {
    throw new TypeError(`${context} must be an object`)
  }
  if (typeof data.timestamp !== 'number' || !Number.isFinite(data.timestamp)) {
    throw new TypeError(`${context}.timestamp must be finite`)
  }
  if (!Number.isSafeInteger(data.timestamp)) {
    throw new RangeError(`${context}.timestamp must be a safe UTC-millisecond integer`)
  }
  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (typeof data[field] !== 'number' || !Number.isFinite(data[field])) {
      throw new TypeError(`${context}.${field} must be finite`)
    }
  }
  if (
    data.high < data.low ||
    data.high < data.open ||
    data.high < data.close ||
    data.low > data.open ||
    data.low > data.close
  ) {
    throw new RangeError(`${context} has inconsistent OHLC values`)
  }
  for (const field of OPTIONAL_NUMBER_FIELDS) {
    const value = data[field]
    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))) {
      throw new TypeError(`${context}.${field} must be finite when present`)
    }
    if (typeof value === 'number' && value < 0) {
      throw new RangeError(`${context}.${field} must not be negative`)
    }
  }
  return { ...data }
}

export function cloneValidatedBars (data: readonly CandleData[]): CandleData[] {
  if (!Array.isArray(data)) {
    throw new TypeError('bars must be an array')
  }
  let previousTimestamp: number | null = null
  return data.map((bar, index) => {
    const copy = cloneValidatedBar(bar, `bars[${index}]`)
    if (previousTimestamp !== null && copy.timestamp <= previousTimestamp) {
      throw new RangeError('bars must be strictly ascending by timestamp')
    }
    previousTimestamp = copy.timestamp
    return copy
  })
}

export interface VisibleRangeData {
  dataIndex: number
  x: number
  data: NeighborData<Nullable<CandleData>>
}
