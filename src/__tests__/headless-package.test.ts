import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function readModuleGraph (entry: URL, modules = new Map<string, string>()): Promise<Map<string, string>> {
  if (modules.has(entry.href)) return modules
  const source = await readFile(entry, 'utf8')
  modules.set(entry.href, source)
  const imports = source.matchAll(/["'](\.\.?\/[^"']+\.js)["']/g)
  for (const match of imports) {
    await readModuleGraph(new URL(match[1], entry), modules)
  }
  return modules
}

test('headless package export is SSR-safe and registers optional built-ins explicitly', async () => {
  const headless = await import('../../dist/entries/headless.js')

  assert.equal(Object.isFrozen(headless.HEADLESS_CAPABILITIES), true)
  assert.equal(headless.HEADLESS_CAPABILITIES.viewport, 'bounded-state-v1')
  assert.equal(headless.HEADLESS_CAPABILITIES.studies, 'typed-plugin-output')
  assert.equal(headless.HEADLESS_CAPABILITIES.drawings, 'host-registered-overlays')
  assert.equal(headless.HEADLESS_CAPABILITIES.screenshot, true)
  assert.equal(typeof headless.registerIndicatorPlugin, 'function')
  assert.equal(typeof headless.registerIndicatorPlugins, 'function')
  assert.equal(typeof headless.createIndicatorTemplateFromPlugin, 'function')
  assert.deepEqual(headless.getSupportedIndicators(), [])
  headless.registerBuiltInExtensions()
  assert.ok(headless.getSupportedIndicators().length >= 50)
  assert.ok(headless.getSupportedOverlays().length >= 40)
})

test('headless package export resolves to declarations and JavaScript', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8')) as {
    exports: Record<string, { types?: string; import?: string; default?: string }>
  }
  assert.deepEqual(packageJson.exports['./headless'], {
    types: './dist/entries/headless.d.ts',
    import: './dist/entries/headless.js',
    default: './dist/entries/headless.js',
  })

  const declaration = await readFile(new URL('../../dist/entries/headless.d.ts', import.meta.url), 'utf8')
  assert.match(declaration, /HeadlessChart/)
  assert.match(declaration, /HeadlessBar/)
  assert.match(declaration, /ChartViewportState/)
  assert.match(declaration, /IndicatorPlugin/)
})

test('headless entry has no React, native UI, stylesheet, or datafeed dependency', async () => {
  const modules = await readModuleGraph(new URL('../../dist/entries/headless.js', import.meta.url))
  const source = [...modules.values()].join('\n')
  const declaration = await readFile(new URL('../../dist/entries/headless.d.ts', import.meta.url), 'utf8')
  const forbidden = [
    /from["']react["']/,
    /react-dom/,
    /AstroneumChart/,
    /SymbolSearchModal/,
    /StandardCryptoDatafeed/,
    /WebSocketDatafeed/,
    /astroneum\.css/,
    /api\.binance\.com/,
    /new WebSocket/,
    /fetch\(/,
    /keydown/,
  ]
  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern)
  }
  assert.doesNotMatch(declaration, /from ['"]react['"]|import ['"]react['"]/)
})
