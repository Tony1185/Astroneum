const http = require('http');
const fs = require('fs');
const path = require('path');

const CDP_PORT = 9223;
const OUT_HTML = path.join(__dirname, 'tradingview-ref.html');

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

      console.log('Taking screenshot...');
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      if (!shot.result || !shot.result.data) {
        console.error('Screenshot failed:', JSON.stringify(shot).substring(0, 500));
        process.exit(1);
      }
      const pngB64 = shot.result.data;
      console.log(`Screenshot: ${(Buffer.from(pngB64, 'base64').length / 1024).toFixed(0)} KB`);

      console.log('Extracting page HTML...');
      const htmlResult = await send('Runtime.evaluate', {
        expression: 'document.documentElement.outerHTML',
        returnByValue: true
      });
      if (htmlResult.result && htmlResult.result.result && htmlResult.result.result.value) {
        var pageHtml = htmlResult.result.result.value;
      } else {
        console.error('HTML extraction failed:', JSON.stringify(htmlResult).substring(0, 500));
        process.exit(1);
      }
      console.log(`Page HTML: ${(pageHtml.length / 1024).toFixed(0)} KB`);

      const titleResult = await send('Runtime.evaluate', {
        expression: 'document.title',
        returnByValue: true
      });
      const pageTitle = (titleResult.result && titleResult.result.result) ? titleResult.result.result.value : 'TradingView';
      console.log(`Page title: ${pageTitle}`);

      console.log('Extracting stylesheets...');
      const cssResult = await send('Runtime.evaluate', {
        expression: `(function() {
          var css = '';
          for (var i = 0; i < document.styleSheets.length; i++) {
            try {
              var sheet = document.styleSheets[i];
              if (sheet.cssRules) {
                for (var j = 0; j < sheet.cssRules.length; j++) {
                  css += sheet.cssRules[j].cssText + '\\n';
                }
              }
            } catch(e) {}
          }
          return css;
        })()`,
        returnByValue: true
      });
      const cssText = (cssResult.result && cssResult.result.result) ? (cssResult.result.result.value || '') : '';
      console.log(`Extracted CSS: ${(cssText.length / 1024).toFixed(0)} KB`);

      console.log('Building self-contained HTML...');

      pageHtml = pageHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
      pageHtml = pageHtml.replace(/<script[^>]*\/>/gi, '');

      const imgTag = `<img src="data:image/png;base64,${pngB64}" alt="TradingView Chart" style="width:100%;height:auto;">`;
      pageHtml = pageHtml.replace(/<canvas[^>]*>[\s\S]*?<\/canvas>/gi, imgTag);
      pageHtml = pageHtml.replace(/<canvas[^>]*\/>/gi, imgTag);
      pageHtml = pageHtml.replace(/<canvas[^>]*>/gi, imgTag);

      pageHtml = pageHtml.replace(/<link[^>]*>/gi, '');

      if (cssText) {
        const styleTag = `<style>\n${cssText}\n</style>`;
        if (pageHtml.includes('</head>')) {
          pageHtml = pageHtml.replace('</head>', styleTag + '\n</head>');
        } else {
          pageHtml = styleTag + pageHtml;
        }
      }

      if (!pageHtml.startsWith('<!DOCTYPE')) {
        pageHtml = '<!DOCTYPE html>\n' + pageHtml;
      }

      fs.writeFileSync(OUT_HTML, pageHtml, 'utf8');
      const finalSize = fs.statSync(OUT_HTML).size;
      console.log(`\nSaved: ${OUT_HTML}`);
      console.log(`Size: ${(finalSize / 1024).toFixed(0)} KB (${(finalSize / 1024 / 1024).toFixed(2)} MB)`);

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
