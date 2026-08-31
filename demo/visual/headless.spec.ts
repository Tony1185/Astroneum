import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const root = resolve(__dirname, '../..')
let server: Server
let origin: string

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
    if (pathname === '/') {
      response.setHeader('content-type', 'text/html; charset=utf-8')
      response.end(`<!doctype html><html><body>
        <div id="left" style="width:640px;height:360px"></div>
        <div id="right" style="width:480px;height:240px"></div>
        <div id="hidden" style="display:none;width:320px;height:180px"></div>
        <script type="module">
          import * as headless from '/dist/entries/headless.js'
          window.headless = headless
        </script>
      </body></html>`)
      return
    }

    const path = resolve(root, `.${pathname}`)
    if (!path.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end()
      return
    }
    try {
      response.setHeader('content-type', extname(path) === '.js' ? 'text/javascript' : 'application/octet-stream')
      response.end(await readFile(path))
    } catch {
      response.writeHead(404).end()
    }
  })
  await new Promise<void>(resolveListen => { server.listen(0, '127.0.0.1', resolveListen) })
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('headless test server did not bind')
  origin = `http://127.0.0.1:${address.port}`
})

test.afterAll(async () => {
  await new Promise<void>((resolveClose, reject) => {
    server.close(error => { error ? reject(error) : resolveClose() })
  })
})

test('headless package mounts, updates, isolates, destroys, and remounts', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => { pageErrors.push(error.message) })
  await page.goto(origin)
  await page.waitForFunction(() => 'headless' in window)

  const result = await page.evaluate(async () => {
    const api = (window as unknown as { headless: {
      asPrice: (value: number) => number
      asTimestamp: (value: number) => number
      createChart: (container: HTMLElement) => {
        id: string
        getBars: () => Array<{ timestamp: number; close: number }>
        replaceBars: (bars: Array<Record<string, number>>) => void
        updateBar: (bar: Record<string, number>) => void
        createIndicator: (name: string, isStack?: boolean) => string | null
        getIndicators: (filter?: { id?: string }) => Array<{
          figures: Array<{ key: string }>
          result: Array<Record<string, number | null>>
        }>
        createOverlay: (value: { name: string; points: Array<{ timestamp: number; value: number }> }) => string | null
        getOverlays: (filter?: { id?: string }) => Array<{ points: Array<{ timestamp?: number; value?: number }> }>
        getStyles: () => { candle: { bar: { upColor: string } } }
        getViewportState: () => { version: 1; barSpace: number; rightOffsetBarCount: number }
        setViewportState: (state: { version: 1; barSpace: number; rightOffsetBarCount: number }) => void
        getConvertPictureUrl: (includeOverlay?: boolean, type?: 'png' | 'jpeg' | 'bmp', backgroundColor?: string) => string
        scrollByDistance: (distance: number, animationDuration?: number) => void
        zoomAtCoordinate: (scale: number, coordinate?: { x: number; y: number }, animationDuration?: number) => void
      }
      destroyChart: (target: HTMLElement | { id: string }) => void
      registerBuiltInExtensions: () => void
      registerIndicatorPlugin: (plugin: {
        name: string
        calc: (data: Array<{ close: number }>) => unknown[]
      }) => void
      registerOverlay: (overlay: {
        name: string
        totalStep: number
        createPointFigures: (params: {
          coordinates: Array<{ x: number; y: number }>
          bounding: { width: number }
        }) => Array<Record<string, unknown>>
      }) => void
    } }).headless
    const left = document.getElementById('left')!
    const right = document.getElementById('right')!
    const hidden = document.getElementById('hidden')!
    api.registerBuiltInExtensions()

    const first = api.createChart(left)
    const duplicate = api.createChart(left)
    const second = api.createChart(right)
    const hiddenChart = api.createChart(hidden)
    first.replaceBars([
      { timestamp: api.asTimestamp(1_000), open: api.asPrice(10), high: api.asPrice(13), low: api.asPrice(9), close: api.asPrice(12) },
      { timestamp: api.asTimestamp(2_000), open: api.asPrice(12), high: api.asPrice(15), low: api.asPrice(11), close: api.asPrice(14) },
    ])
    first.updateBar({ timestamp: api.asTimestamp(2_000), open: api.asPrice(12), high: api.asPrice(16), low: api.asPrice(11), close: api.asPrice(15) })
    second.replaceBars([
      { timestamp: api.asTimestamp(3_000), open: api.asPrice(20), high: api.asPrice(22), low: api.asPrice(19), close: api.asPrice(21) },
    ])

    const mounted = {
      duplicateIsSame: duplicate === first,
      distinctIds: first.id !== second.id && second.id !== hiddenChart.id,
      firstBars: first.getBars(),
      secondBars: second.getBars(),
      leftChildren: left.children.length,
      rightChildren: right.children.length,
      hiddenChildren: hidden.children.length,
    }

    const capabilityBars = Array.from({ length: 100 }, (_, index) => ({
      timestamp: api.asTimestamp(10_000 + index * 1_000),
      open: api.asPrice(100 + index),
      high: api.asPrice(102 + index),
      low: api.asPrice(99 + index),
      close: api.asPrice(101 + index),
    }))
    first.replaceBars(capabilityBars)
    first.setViewportState({ version: 1, barSpace: 20, rightOffsetBarCount: -10 })
    const viewportState = first.getViewportState()
    let invalidViewportRejected = false
    try {
      first.setViewportState({ version: 1, barSpace: 0, rightOffsetBarCount: 0 })
    } catch {
      invalidViewportRejected = true
    }

    api.registerIndicatorPlugin({
      name: 'BARWISE_TEST_OUTPUTS',
      calc: data => data.map(bar => Object.fromEntries(
        Array.from({ length: 16 }, (_, index) => [`series${index}`, bar.close * (index + 1)])
      )),
    })
    const indicatorId = first.createIndicator('BARWISE_TEST_OUTPUTS', true)
    for (let attempt = 0; attempt < 20; attempt++) {
      if ((first.getIndicators({ id: indicatorId ?? undefined })[0]?.result.length ?? 0) === capabilityBars.length) break
      await new Promise(resolve => { setTimeout(resolve, 10) })
    }
    const indicatorResult = first.getIndicators({ id: indicatorId ?? undefined })[0]?.result ?? []

    api.registerOverlay({
      name: 'barwiseTestLine',
      totalStep: 2,
      createPointFigures: ({ coordinates, bounding }) => [{
        type: 'line',
        attrs: { coordinates: [{ x: 0, y: coordinates[0].y }, { x: bounding.width, y: coordinates[0].y }] },
      }],
    })
    const overlayIds = Array.from({ length: 16 }, (_, index) => first.createOverlay({
      name: 'barwiseTestLine',
      points: [{ timestamp: capabilityBars[10].timestamp, value: 111 + index }],
    }))
    const overlay = first.getOverlays({ id: overlayIds[0] ?? undefined })[0]
    const indicatorFigureCount = first.getIndicators({ id: indicatorId ?? undefined })[0]?.figures.length
    const overlayCount = first.getOverlays().length
    await new Promise(resolve => { setTimeout(resolve, 50) })
    const screenshotUrl = first.getConvertPictureUrl(true, 'png', '#010203')
    const screenshot = new Image()
    await new Promise<void>((resolve, reject) => {
      screenshot.onload = () => { resolve() }
      screenshot.onerror = () => { reject(new Error('headless screenshot did not decode')) }
      screenshot.src = screenshotUrl
    })
    const screenshotCanvas = document.createElement('canvas')
    screenshotCanvas.width = screenshot.naturalWidth
    screenshotCanvas.height = screenshot.naturalHeight
    const screenshotContext = screenshotCanvas.getContext('2d')!
    screenshotContext.drawImage(screenshot, 0, 0)
    const colorCanvas = document.createElement('canvas')
    colorCanvas.width = 1
    colorCanvas.height = 1
    const colorContext = colorCanvas.getContext('2d')!
    colorContext.fillStyle = first.getStyles().candle.bar.upColor
    colorContext.fillRect(0, 0, 1, 1)
    const candleColor = colorContext.getImageData(0, 0, 1, 1).data
    const screenshotPixels = screenshotContext.getImageData(0, 0, screenshotCanvas.width, screenshotCanvas.height).data
    let candleColorPixelCount = 0
    for (let index = 0; index < screenshotPixels.length; index += 4) {
      if (
        screenshotPixels[index] === candleColor[0] &&
        screenshotPixels[index + 1] === candleColor[1] &&
        screenshotPixels[index + 2] === candleColor[2] &&
        screenshotPixels[index + 3] === candleColor[3]
      ) candleColorPixelCount++
    }

    first.scrollByDistance(100, 1_000)
    first.zoomAtCoordinate(1.5, undefined, 1_000)
    api.destroyChart(first)
    api.destroyChart(first)
    const replacement = api.createChart(left)
    const replacementId = replacement.id
    api.destroyChart(replacement)
    api.destroyChart(second)
    api.destroyChart(hidden)

    return {
      ...mounted,
      replacementIdChanged: replacementId !== first.id,
      viewportState,
      invalidViewportRejected,
      indicatorResultLength: indicatorResult.length,
      indicatorFigureCount,
      indicatorLastValue: indicatorResult.at(-1)?.series15,
      overlayCount,
      overlayPoint: overlay?.points[0],
      screenshotDimensions: [screenshot.naturalWidth, screenshot.naturalHeight],
      candleColorPixelCount,
      remainingChildren: left.children.length + right.children.length + hidden.children.length,
      remainingMarkers: [left, right, hidden].filter(container => container.hasAttribute('k-line-chart-id')).length,
    }
  })

  await page.waitForTimeout(50)

  expect(pageErrors).toEqual([])
  expect(result.duplicateIsSame).toBe(true)
  expect(result.distinctIds).toBe(true)
  expect(result.firstBars).toHaveLength(2)
  expect(result.firstBars[1]).toMatchObject({ timestamp: 2_000, close: 15 })
  expect(result.secondBars).toHaveLength(1)
  expect(result.leftChildren).toBe(1)
  expect(result.rightChildren).toBe(1)
  expect(result.hiddenChildren).toBe(1)
  expect(result.replacementIdChanged).toBe(true)
  expect(result.viewportState).toEqual({ version: 1, barSpace: 20, rightOffsetBarCount: -10 })
  expect(result.invalidViewportRejected).toBe(true)
  expect(result.indicatorResultLength).toBe(100)
  expect(result.indicatorFigureCount).toBe(16)
  expect(result.indicatorLastValue).toBe(3_200)
  expect(result.overlayCount).toBe(16)
  expect(result.overlayPoint).toMatchObject({ timestamp: 20_000, value: 111 })
  expect(result.screenshotDimensions).toEqual([640, 360])
  expect(result.candleColorPixelCount).toBeGreaterThan(0)
  expect(result.remainingChildren).toBe(0)
  expect(result.remainingMarkers).toBe(0)
})
