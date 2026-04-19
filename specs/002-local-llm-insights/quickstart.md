# Quickstart: Local LLM Insights

**Feature**: 002-local-llm-insights

## Prerequisites

1. **Ollama** installed and running — see [ollama.com](https://ollama.com)
2. **A model** pulled locally:
   ```sh
   ollama pull llama3.2
   ```
3. **The app** served via a local web server:
   ```sh
   npx serve .
   ```

## Step-by-step

### 1. Enable AI features

1. Open the app in a browser (e.g. `http://localhost:3000`)
2. Go to **Settings** tab
3. Toggle **AI-inzichten / AI Insights** ON
4. Click **Test verbinding / Test connection** — expect a green indicator with the Ollama version
5. Click **Ontdek modellen / Discover models** — select a model from the dropdown
6. Adjust temperature if needed (default 0.7)

### 2. Get a single-entry reflection

1. Complete a check-in (mood, energy, emotions, body signals, notes)
2. Save the entry
3. On the entry summary, click **AI-reflectie / AI Reflection**
4. Wait for the response (~5–15 seconds on 7B models)
5. Read the insight, optionally save it with **Bewaar inzicht / Save insight**

### 3. Get trend analysis

1. Go to **Dashboard** tab
2. Click **AI-trends / AI Trends**
3. Select a period (7 days, 30 days, etc.)
4. Wait for the response
5. Read the multi-entry trend insight

### 4. Review saved insights

1. Go to **Overview** tab
2. Scroll to **AI-inzichten / AI Insights** section
3. Browse saved insights, optionally delete them

## Architecture quick reference

```
modules/ai.js     — MCI.AI module (LLM communication, prompt construction, UI)
css/ai.css        — AI-specific styles
data/static.js    — MCI.Data.aiPrompts (prompt templates)
data/translations.js — AI translation keys
lib/core.js       — KEYS.aiInsights added
boot.js           — MCI.AI.init() added
```

## Key decisions

- **ES5 only** — `XMLHttpRequest` wrapper around `fetch` is not needed; `fetch` is available in all modern browsers. Use `fetch` with `.then()` chaining (no async/await).
- **Non-streaming** — `stream: false` for simplicity; single JSON response.
- **Ephemeral by default** — Responses are not auto-saved; user must explicitly choose to save.
- **Localhost only** — `aiEndpoint` is validated to be a localhost URL at save time.
