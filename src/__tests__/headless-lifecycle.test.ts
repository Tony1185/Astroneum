import assert from 'node:assert/strict'
import test from 'node:test'

import ChartRegistry, { type ChartRegistryContainer, type ManagedChart } from '../engine/ChartRegistry'

class TestContainer implements ChartRegistryContainer {
  private readonly attributes = new Map<string, string>()

  getAttribute (name: string): string | null {
    return this.attributes.get(name) ?? null
  }

  setAttribute (name: string, value: string): void {
    this.attributes.set(name, value)
  }

  removeAttribute (name: string): void {
    this.attributes.delete(name)
  }
}

class TestChart implements ManagedChart {
  id = ''
  destroyCount = 0

  destroy (): void {
    this.destroyCount++
  }
}

test('chart registry makes duplicate initialization idempotent', () => {
  const registry = new ChartRegistry<TestChart>()
  const container = new TestContainer()
  let createCount = 0
  const create = (): TestChart => {
    createCount++
    return new TestChart()
  }

  const first = registry.getOrCreate(container, create)
  const second = registry.getOrCreate(container, create)

  assert.ok(first)
  assert.ok(second)
  assert.equal(first.created, true)
  assert.equal(second.created, false)
  assert.equal(first.chart, second.chart)
  assert.equal(createCount, 1)
})

test('chart registry isolates containers and supports recreate after destroy', () => {
  const registry = new ChartRegistry<TestChart>()
  const left = new TestContainer()
  const right = new TestContainer()
  const leftChart = registry.getOrCreate(left, () => new TestChart())!.chart
  const rightChart = registry.getOrCreate(right, () => new TestChart())!.chart

  assert.notEqual(leftChart.id, rightChart.id)
  assert.equal(registry.dispose(leftChart), true)
  assert.equal(registry.dispose(leftChart), false)
  assert.equal(leftChart.destroyCount, 1)
  assert.equal(rightChart.destroyCount, 0)
  assert.equal(left.getAttribute('k-line-chart-id'), null)

  const replacement = registry.getOrCreate(left, () => new TestChart())!.chart
  assert.notEqual(replacement.id, leftChart.id)
  assert.equal(registry.dispose(right), true)
  assert.equal(rightChart.destroyCount, 1)
})

test('chart registry rejects containers marked by another registry', () => {
  const firstRegistry = new ChartRegistry<TestChart>()
  const secondRegistry = new ChartRegistry<TestChart>()
  const container = new TestContainer()

  assert.ok(firstRegistry.getOrCreate(container, () => new TestChart()))
  assert.equal(secondRegistry.getOrCreate(container, () => new TestChart()), null)
})

test('chart registry releases ownership when destroy throws', () => {
  class ThrowingChart extends TestChart {
    override destroy (): void {
      super.destroy()
      throw new Error('destroy failed')
    }
  }

  const registry = new ChartRegistry<TestChart>()
  const container = new TestContainer()
  const chart = registry.getOrCreate(container, () => new ThrowingChart())!.chart

  assert.throws(() => { registry.dispose(chart) }, /destroy failed/)
  assert.equal(container.getAttribute('k-line-chart-id'), null)
  assert.ok(registry.getOrCreate(container, () => new TestChart()))
})
