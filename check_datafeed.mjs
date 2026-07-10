import('./dist/index.js').then(async m => {
  console.log('Testing datafeed...')
  try {
    const df = m.createStandardCryptoDatafeed({ smoothingDuration: 320 })
    const all = await df.searchSymbols('')
    console.log('Symbols:', all.map(s => s.ticker).join(', '))

    // Test a mock history fetch (bounded range, from > 0)
    const sym = all[0]
    const period = { multiplier: 1, timespan: 'minute', text: '1m' }
    const now = Date.now()
    const from = now - 500 * 60_000
    console.log('Fetching history (bounded)...')
    const bars = await df.getHistoryData(sym, period, from, now)
    console.log('Got bars:', bars.length, bars.length > 0 ? `first ts: ${bars[0].timestamp}` : '')

    console.log('ALL OK')
  } catch (e) {
    console.error('FAIL:', e.message, e.stack)
  }
}).catch(e => console.error('IMPORT FAIL:', e.message, e.stack))
