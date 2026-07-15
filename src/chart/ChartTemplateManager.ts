import type { AstroneumHandle, SerializedChartState } from '@/types'

const STORAGE_KEY = 'astroneum-chart-templates'
const ACTIVE_TEMPLATE_STORAGE_KEY = 'astroneum-active-chart-template'

export interface ChartTemplate {
  id: string
  name: string
  state: SerializedChartState
  createdAt: string
  updatedAt?: string
}

/**
 * ChartTemplateManager — save/load named chart configurations.
 *
 * Templates persist the complete chart state to localStorage.
 *
 * Usage:
 *   const templates = ChartTemplateManager.getInstance()
 *   templates.save('My Setup', chart.serializeState())
 *   templates.load('My Setup', chart) // applies to current chart
 */
export class ChartTemplateManager {
  private static _instance: ChartTemplateManager | null = null
  private _templates: ChartTemplate[] = []

  private constructor() {
    this._load()
  }

  static getInstance(): ChartTemplateManager {
    if (!ChartTemplateManager._instance) {
      ChartTemplateManager._instance = new ChartTemplateManager()
    }
    return ChartTemplateManager._instance
  }

  /** Save current chart state as a named template. Overwrites if name exists. */
  save(name: string, state: SerializedChartState): ChartTemplate {
    const trimmed = name.trim()
    if (!trimmed) throw new TypeError('Template name is required')
    const existing = this._templates.findIndex(t => t.name === trimmed)
    const updatedAt = new Date().toISOString()
    const template: ChartTemplate = existing >= 0
      ? { ...this._templates[existing], state, updatedAt }
      : {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: trimmed,
          state,
          createdAt: updatedAt,
          updatedAt,
        }

    if (existing >= 0) {
      this._templates[existing] = template
    } else {
      this._templates.push(template)
    }

    this._persist()
    return template
  }

  /** Load a template onto a chart. Returns false if template not found. */
  load(name: string, chart: AstroneumHandle): boolean {
    const template = this._templates.find(t => t.name === name)
    if (!template) return false
    chart.loadState(template.state)
    return true
  }

  /** Delete a template by name. Returns false if not found. */
  delete(name: string): boolean {
    const prev = this._templates.length
    this._templates = this._templates.filter(t => t.name !== name)
    if (this._templates.length < prev) {
      this._persist()
      if (this.getActiveName() === name) this.clearActiveName()
      return true
    }
    return false
  }

  /** List all saved template names. */
  list(): string[] {
    return this._templates.map(t => t.name)
  }

  /** Get a template by name. */
  get(name: string): ChartTemplate | undefined {
    return this._templates.find(t => t.name === name)
  }

  /** Get all templates. */
  getAll(): ChartTemplate[] {
    return [...this._templates]
  }

  rename(name: string, nextName: string): ChartTemplate | null {
    const index = this._templates.findIndex(template => template.name === name)
    const trimmed = nextName.trim()
    if (index < 0 || !trimmed || (trimmed !== name && this._templates.some(template => template.name === trimmed))) return null
    if (trimmed === name) return this._templates[index]
    const template = { ...this._templates[index], name: trimmed, updatedAt: new Date().toISOString() }
    this._templates[index] = template
    this._persist()
    if (this.getActiveName() === name) this.setActiveName(trimmed)
    return template
  }

  duplicate(name: string): ChartTemplate | null {
    const template = this.get(name)
    if (!template) return null
    let copyName = `${template.name} copy`
    let index = 2
    while (this._templates.some(item => item.name === copyName)) {
      copyName = `${template.name} copy ${index++}`
    }
    return this.save(copyName, structuredClone(template.state))
  }

  setActiveName(name: string): boolean {
    if (!this._templates.some(template => template.name === name)) return false
    try {
      localStorage.setItem(ACTIVE_TEMPLATE_STORAGE_KEY, name)
      return true
    } catch {
      return false
    }
  }

  getActiveName(): string | null {
    try {
      const name = localStorage.getItem(ACTIVE_TEMPLATE_STORAGE_KEY)
      return name && this._templates.some(template => template.name === name) ? name : null
    } catch {
      return null
    }
  }

  clearActiveName(): void {
    try {
      localStorage.removeItem(ACTIVE_TEMPLATE_STORAGE_KEY)
    } catch { }
  }

  private _persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._templates))
  }

  private _load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      // Schema validation — reject corrupted/malicious data
      this._templates = parsed.filter((t: unknown) => {
        if (t === null || typeof t !== 'object') return false
        const obj = t as Record<string, unknown>
        return typeof obj.id === 'string' &&
          typeof obj.name === 'string' &&
          typeof obj.state === 'object' && obj.state !== null &&
          typeof obj.createdAt === 'string'
      }).map((template: Record<string, unknown>) => ({
        ...template,
        updatedAt: typeof template.updatedAt === 'string' ? template.updatedAt : template.createdAt,
      })) as ChartTemplate[]
    } catch { /* corrupt data */ }
  }
}

export default ChartTemplateManager
