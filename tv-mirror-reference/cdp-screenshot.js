const http = require('http');
const fs = require('fs');
const path = require('path');

const CDP_PORT = 9223;
const OUT_PNG = path.join(__dirname, 'chart-screenshot.png');
const OUT_HTML = path.join(__dirname, 'index.html');

http.get(`http://localhost:${CDP_PORT}/json`, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const page = tabs.find(t => t.type === 'page');
    if (!page) { console.error('No page tab found'); process.exit(1); }

    console.log('Connecting to tab:', page.title);

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.addEventListener('open', async () => {
      console.log('CDP connected, capturing screenshot...');

      function send(method, params) {
        return new Promise((resolve) => {
          const id = msgId++;
          pending.set(id, resolve);
          ws.send(JSON.stringify({ id, method, params: params || {} }));
        });
      }

      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });

      if (screenshot.error) {
        console.error('Screenshot error:', screenshot.error.message);
        process.exit(1);
      }

      const b64 = screenshot.result.data;
      fs.writeFileSync(OUT_PNG, Buffer.from(b64, 'base64'));
      console.log(`Screenshot saved: ${OUT_PNG} (${(fs.statSync(OUT_PNG).size / 1024).toFixed(0)} KB)`);

      const pngB64 = b64;
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TradingView BTCUSDT</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #1e222d; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; }
  img { max-width: 100%; height: auto; display: block; }
</style>
</head>
<body>
<img src="data:image/png;base64,${pngB64}" alt="TradingView BTCUSDT Chart">
</body>
</html>`;

      fs.writeFileSync(OUT_HTML, html, 'utf8');
      console.log(`HTML saved: ${OUT_HTML} (${(fs.statSync(OUT_HTML).size / 1024).toFixed(0)} KB)`);
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
