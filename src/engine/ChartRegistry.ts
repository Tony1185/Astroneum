export interface ChartRegistryContainer {
  getAttribute: (name: string) => string | null
  setAttribute: (name: string, value: string) => void
  removeAttribute: (name: string) => void
}

export interface ManagedChart {
  id: string
  destroy: () => void
}

export interface ChartRegistryResult<T> {
  chart: T
  created: boolean
}

interface ChartRegistryEntry<T> {
  chart: T
  container: ChartRegistryContainer
  id: string
}

const CHART_ID_ATTRIBUTE = 'k-line-chart-id'

export default class ChartRegistry<T extends ManagedChart> {
  private readonly _entries = new Map<string, ChartRegistryEntry<T>>()
  private readonly _containerEntries = new WeakMap<ChartRegistryContainer, ChartRegistryEntry<T>>()
  private _nextId = 1

  getOrCreate (
    container: ChartRegistryContainer,
    create: (id: string) => T
  ): ChartRegistryResult<T> | null {
    const current = this._containerEntries.get(container)
    if (current !== undefined) {
      return { chart: current.chart, created: false }
    }

    const markedId = container.getAttribute(CHART_ID_ATTRIBUTE)
    if (markedId !== null) {
      const marked = this._entries.get(markedId)
      if (marked?.container === container) {
        this._containerEntries.set(container, marked)
        return { chart: marked.chart, created: false }
      }
      return null
    }

    const id = `k_line_chart_${this._nextId++}`
    const chart = create(id)
    chart.id = id
    const entry = { chart, container, id }
    this._entries.set(id, entry)
    this._containerEntries.set(container, entry)
    try {
      container.setAttribute(CHART_ID_ATTRIBUTE, id)
    } catch (error) {
      this._entries.delete(id)
      this._containerEntries.delete(container)
      chart.destroy()
      throw error
    }
    return { chart, created: true }
  }

  dispose (target: ChartRegistryContainer | T): boolean {
    const entry = this._resolve(target)
    if (entry === null) {
      return false
    }
    try {
      entry.chart.destroy()
    } finally {
      if (this._entries.get(entry.id) === entry) {
        this._entries.delete(entry.id)
      }
      if (this._containerEntries.get(entry.container) === entry) {
        this._containerEntries.delete(entry.container)
      }
      if (entry.container.getAttribute(CHART_ID_ATTRIBUTE) === entry.id) {
        entry.container.removeAttribute(CHART_ID_ATTRIBUTE)
      }
    }
    return true
  }

  private _resolve (target: ChartRegistryContainer | T): ChartRegistryEntry<T> | null {
    const containerEntry = this._containerEntries.get(target as ChartRegistryContainer)
    if (containerEntry !== undefined) {
      return containerEntry
    }
    const id = (target as T).id
    if (typeof id !== 'string') {
      return null
    }
    const chartEntry = this._entries.get(id)
    return chartEntry?.chart === target ? chartEntry : null
  }
}
