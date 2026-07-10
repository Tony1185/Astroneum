const http = require("http");
const fs = require("fs");
const delay = ms => new Promise(r => setTimeout(r, ms));

http.get("http://localhost:9223/json", (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    const tabs = JSON.parse(data);
    const page = tabs.find(t => t.type === "page");
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let msgId = 1; const pending = new Map();
    function send(method, params) { return new Promise((resolve) => { const id = msgId++; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params: params || {} })); }); }
    ws.addEventListener("message", (e) => { var p = JSON.parse(e.data); if (p.id && pending.has(p.id)) { pending.get(p.id)(p); pending.delete(p.id); } });
    ws.addEventListener("open", async () => {
      const arrowArias = ["Cursors","Trend tools","Gann and Fibonacci tools","Patterns","Forecasting and measurement tools","Geometric shapes","Annotation tools","Icons","Magnets","Hide options","Remove options"];
      const allSubButtons = {};

      for (const aria of arrowArias) {
        await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
        await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
        await delay(300);

        await send("Runtime.evaluate", {
          expression: "(function(){var arrows=document.querySelectorAll('.arrow-vLxmOgZ3');for(var i=0;i<arrows.length;i++){if(arrows[i].getAttribute('aria-label')==='" + aria.replace(/'/g,"\\'") + "'){arrows[i].click();return 'ok'}}return 'not found'})()",
          returnByValue: true
        });
        await delay(1000);

        // Capture the flyout rows — each row has a button-fOp9u5tE containing the tool icon + label text
        var result = await send("Runtime.evaluate", {
          expression: "(function(){var view=document.querySelector('.newView-vLxmOgZ3');if(!view)return JSON.stringify([]);var r=[];view.querySelectorAll('.button-fOp9u5tE').forEach(function(b){if(b.offsetParent===null)return;var svg=b.querySelector('svg');var svgHtml=svg?svg.outerHTML.substring(0,400):'';var text='';var label=b.querySelector('.buttonContent-gIRstbSk, .label, [class*=label], [class*=title], [class*=text]');if(label)text=label.textContent.trim();if(!text)text=b.textContent.trim().substring(0,60);var br=b.getBoundingClientRect();r.push({label:text,svg:svgHtml,x:Math.round(br.x),y:Math.round(br.y),w:Math.round(br.width),h:Math.round(br.height)})});return JSON.stringify(r)})()",
          returnByValue: true
        });
        var btns = JSON.parse(result.result.result.value);
        allSubButtons[aria] = btns;
        console.log(aria + ": " + btns.length + " tools");
        btns.forEach(function(b) { console.log("  " + b.label); });
      }

      await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });

      // Capture all top-level buttons
      var allResult = await send("Runtime.evaluate", {
        expression: "(function(){var r=[];document.querySelectorAll('button,[role=button]').forEach(function(e){if(e.offsetParent===null&&e.offsetWidth===0)return;var svg=e.querySelector('svg');var svgHtml=svg?svg.outerHTML.substring(0,400):'';var rect=e.getBoundingClientRect();r.push({tag:e.tagName.toLowerCase(),qa:e.getAttribute('data-qa-id')||'',aria:e.getAttribute('aria-label')||'',text:(e.textContent||'').trim().substring(0,60),title:e.getAttribute('title')||'',name:e.getAttribute('data-name')||'',cls:(e.className||'').toString().substring(0,80),svg:svgHtml,x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.width),h:Math.round(rect.height)})});return JSON.stringify(r)})()",
        returnByValue: true
      });
      var allBtns = JSON.parse(allResult.result.result.value);
      var output = JSON.stringify({ subButtons: allSubButtons, allButtons: allBtns }, null, 2);
      fs.writeFileSync("C:\\Users\\Joooo\\tv-mirror\\button-scan.json", output, "utf8");
      console.log("\nSaved " + (output.length/1024).toFixed(0) + " KB. Top:" + allBtns.length + " Sub:" + Object.values(allSubButtons).reduce(function(a,b){return a+b.length},0));
      ws.close(); process.exit(0);
    });
  });
}).on("error", err => { console.error(err.message); process.exit(1); });
