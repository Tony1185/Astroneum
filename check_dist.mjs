import('./dist/index.js').then(m => {
  console.log('OK exports:', Object.keys(m).slice(0, 20).join(','))
  console.log('AstroneumChart type:', typeof m.AstroneumChart)
  console.log('createStandardCryptoDatafeed type:', typeof m.createStandardCryptoDatafeed)
  console.log('STANDARD_CRYPTO_SYMBOLS length:', m.STANDARD_CRYPTO_SYMBOLS?.length)
}).catch(e => console.error('FAIL:', e.message, e.stack))
