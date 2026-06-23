---
name: screenshot
description: Serve the app and capture a headless-Chrome screenshot of a given view/state for visual verification. Use after any UI/CSS change to this vanilla-JS app (it has no test renderer for visuals), or when the user asks to see/screenshot a view.
---

# Screenshot a view

This app has no component framework — the only way to confirm UI looks right is to render it. Serve it and screenshot with the locally-installed Chrome (headless). All steps run from the repo root.

## 1. Serve the app (background)

```bash
npx --yes serve . -p 3007 >/tmp/serve.log 2>&1 &
sleep 3
```

Use a free port (3007 is fine; tests use 3000, dev uses 3004). `serve` strips `.html` and redirects `/foo.html` → `/foo` (301) — point Chrome at the clean URL (`/_seed`) or `/`.

## 2. (Optional) Seed state via localStorage

To land on a specific view or a populated check-in, write a tiny redirect page that seeds `localStorage` then navigates to `/`. Keys are documented in @architecture.md; values are JSON.

```bash
cat > ._seed.html <<'EOF'
<!doctype html><meta charset=utf-8><script>
var d=new Date(),p=function(n){return('0'+n).slice(-2)};
var ymd=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
// active tab: "checkin" | "overview" | "settings" | "info" | "home"
localStorage.setItem('local-mood-tracker-active-tab','"checkin"');
// optional: a populated entry for today so components render filled
var entry={coreFeeling:'serenity',wheelType:'act',customFeelings:'Restless',
  energy:{physical:70,mental:55,emotional:65},bodySignals:['chest','abdomen'],
  actions:'Walk, Meditate',moodRow:7,moodCol:7,moodLabel:'Peaceful',moodScore:3,
  weather:{temperature:14,weathercode:0,windspeed:9}};
var e={};e[ymd+'_083000000']=entry;
localStorage.setItem('local-mood-tracker-entries',JSON.stringify(e));
location.replace('/');
</script>
EOF
```

Delete `._seed.html` when done.

## 3. Capture

Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe`. Use `--virtual-time-budget` so JS finishes before capture. Force light or dark via `--blink-settings=preferredColorScheme=1` (light) or `=2` (dark).

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu `
  --hide-scrollbars --user-data-dir="$env:TEMP\mci-shot" --blink-settings="preferredColorScheme=1" `
  --virtual-time-budget=7000 --window-size=1000,2200 `
  --screenshot="D:\UserData\Sven\Repos\Prive\mindful-check-in\.shot.png" "http://localhost:3007/_seed"
```

Then Read `.shot.png`. To inspect one region, crop with `System.Drawing` in PowerShell (the page is tall): load the bitmap, `DrawImage` a sub-rectangle into a new bitmap, save, and Read that.

## 4. Drive interactions (when a click matters)

Chrome can't click via `--screenshot`. Node 24 here has a global `WebSocket`, so drive Chrome over CDP with no dependencies: launch with `--remote-debugging-port=9222`, fetch the target from `http://localhost:9222/json/list`, open the `webSocketDebuggerUrl`, then `Runtime.evaluate` to `element.click()` / read state, and `Page.captureScreenshot` (`captureBeyondViewport:true` for content below the fold). Use forward-slash paths in `spawn` to avoid bash mangling backslashes.

## 5. Clean up

Remove `._seed.html`, any `.shot*.png`, and stop the server (kill the listener on the port). Never leave the dev server or temp PNGs behind.
