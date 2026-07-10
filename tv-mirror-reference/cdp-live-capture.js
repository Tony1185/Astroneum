const http = require('http');
const fs = require('fs');
const path = require('path');

const CDP_PORT = 9223;
const OUT_HTML = path.join(__dirname, 'tradingview-live.html');

http.get(`http://localhost:${CDP_PORT}/json`, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const page = tabs.find(t => t.type === 'page');
    if (!page) { console.error('No page tab found'); process.exit(1); }

    console.log('Connecting to:', page.title);
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    function send(method, params) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params: params || {} }));
      });
    }

    ws.addEventListener('open', async () => {
      console.log('CDP connected');

      // 1. Screenshot for canvas replacement
      console.log('Taking screenshot...');
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      if (!shot.result || !shot.result.data) {
        console.error('Screenshot failed'); process.exit(1);
      }
      const pngB64 = shot.result.data;
      console.log(`Screenshot: ${(Buffer.from(pngB64, 'base64').length / 1024).toFixed(0)} KB`);

      // 2. Get full outer HTML (WITH scripts)
      console.log('Extracting page HTML (scripts preserved)...');
      const htmlResult = await send('Runtime.evaluate', {
        expression: 'document.documentElement.outerHTML',
        returnByValue: true
      });
      if (!htmlResult.result || !htmlResult.result.result || !htmlResult.result.result.value) {
        console.error('HTML extraction failed:', JSON.stringify(htmlResult).substring(0, 500));
        process.exit(1);
      }
      let pageHtml = htmlResult.result.result.value;
      console.log(`Page HTML: ${(pageHtml.length / 1024).toFixed(0)} KB`);

      // 3. Replace canvas with screenshot (canvas is blank without JS re-rendering)
      const imgTag = `<img src="data:image/png;base64,${pngB64}" alt="TradingView Chart" style="width:100%;height:auto;">`;
      pageHtml = pageHtml.replace(/<canvas[^>]*>[\s\S]*?<\/canvas>/gi, imgTag);
      pageHtml = pageHtml.replace(/<canvas[^>]*\/>/gi, imgTag);
      pageHtml = pageHtml.replace(/<canvas[^>]*>/gi, imgTag);

      // 4. Remove CSP meta tags so scripts can execute from file://
      pageHtml = pageHtml.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');

      // 5. Remove X-Frame-Options meta if present
      pageHtml = pageHtml.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');

      // 6. Ensure DOCTYPE
      if (!pageHtml.startsWith('<!DOCTYPE')) {
        pageHtml = '<!DOCTYPE html>\n' + pageHtml;
      }

      fs.writeFileSync(OUT_HTML, pageHtml, 'utf8');
      const finalSize = fs.statSync(OUT_HTML).size;
      console.log(`\nSaved: ${OUT_HTML}`);
      console.log(`Size: ${(finalSize / 1024).toFixed(0)} KB (${(finalSize / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`Scripts preserved, CSP removed, canvas replaced with screenshot`);

      ws.close();
      process.exit(0);
    });

    ws.addEventListener('message', (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.id && pending.has(parsed.id)) {
        pending.get(parsed.id)(parsed);
        pending.delete(parsed.id);
      }
    });

    ws.addEventListener('error', (err) => {
      console.error('WebSocket error:', err.message || err);
      process.exit(1);
    });
  });
}).on('error', err => {
  console.error('HTTP error:', err.message);
  process.exit(1);
});
