# Research: Local LLM Insights

**Feature**: 002-local-llm-insights
**Date**: 2026-04-18

## 1. Ollama API Integration

### Decision: Use `/api/chat` endpoint (not `/api/generate`)

**Rationale**: The chat completion endpoint (`POST /api/chat`) supports system/user/assistant message roles, which enables structured prompting with a system prompt (persona + rules) and a user message (entry data). The simpler `/api/generate` endpoint lacks role separation.

**Alternatives considered**:
- `/api/generate` — simpler but no role separation; harder to control LLM behaviour with system prompts
- OpenAI-compatible `/v1/chat/completions` — Ollama supports this, but using the native API avoids compatibility assumptions

### Key API Details

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /api/chat` | Chat completion | Send analysis requests with system + user messages |
| `GET /api/tags` | List models | Discover available models for settings dropdown |
| `GET /api/version` | Version check | Verify Ollama is running (connection test) |
| `GET /api/ps` | Running models | Show which models are loaded in memory |

### Request format (non-streaming)

```json
{
  "model": "llama3.2",
  "messages": [
    { "role": "system", "content": "You are a reflective wellness coach..." },
    { "role": "user", "content": "Here is my check-in data: ..." }
  ],
  "stream": false,
  "options": {
    "temperature": 0.7
  }
}
```

### Response format

```json
{
  "model": "llama3.2",
  "message": { "role": "assistant", "content": "..." },
  "done": true,
  "total_duration": 5191566416,
  "eval_count": 298
}
```

### Decision: Use `stream: false`

**Rationale**: Non-streaming is simpler to implement in ES5 vanilla JS (no ReadableStream parsing). A single `fetch` + JSON parse. The response time for small prompts (~4000 tokens) is typically under 15 seconds on consumer hardware with 7B+ models.

**Alternatives considered**:
- Streaming (`stream: true`) — better UX for long responses (progressive rendering), but requires chunked JSON parsing which is complex in ES5 without libraries. Can be added as a future enhancement.

## 2. CORS Handling

### Decision: Ollama allows localhost CORS by default

**Rationale**: Ollama sets `Access-Control-Allow-Origin: *` by default for its HTTP API. When the app is served via `npx serve` (localhost), `fetch` to `localhost:11434` works without CORS issues.

**Caveat**: Opening `index.html` via `file://` protocol will fail CORS for Ollama requests. This is documented in the spec assumptions and aligns with Constitution II (local web server clause).

**Alternatives considered**:
- Proxy server — adds complexity, violates zero-dependency principle
- Browser extension — too much friction for users

## 3. Token Budget Management

### Decision: ~4000 token budget per request, client-side summarisation

**Rationale**: Most 7B models have 4096–8192 context windows. Keeping requests under ~4000 tokens (system prompt + entry data) leaves room for the model's response. For single entries, this is never an issue. For trend analysis over many entries, the app must summarise.

### Summarisation strategy

1. **Single entry** (P1): Send full entry JSON — always fits within budget.
2. **Multi-entry (≤10)**: Send all entries with non-essential fields trimmed (drop `id`, `updatedAt`, `weather`).
3. **Multi-entry (11–30)**: Aggregate into summary stats: mood distribution, avg energy per dimension, top body signals, top emotions, actions frequency.
4. **Multi-entry (>30)**: Same as above but explicitly note the time span was summarised. Show a notice to the user.

**Alternatives considered**:
- Paginated requests (send entries in batches, chain responses) — complex, slow, unreliable
- Let the LLM truncate — model-dependent, may lose important data silently

## 4. Prompt Template Architecture

### Decision: Templates as structured objects in `data/static.js`

**Rationale**: Aligns with existing pattern — all static data lives in `MCI.Data.*`. Prompt templates are static content, similar to wheel variants or weather codes. Using structured objects (not raw strings) enables per-language system prompts and user message templates with `{placeholder}` substitution matching the existing `MCI.t()` pattern.

### Template structure

```js
MCI.Data.aiPrompts = {
  reflection: {
    system: { en: "...", nl: "..." },
    user: { en: "...", nl: "..." }
  },
  trend: { ... },
  action: { ... },
  summary: { ... }
};
```

**Alternatives considered**:
- Separate file (`data/prompts.js`) — possible but unnecessary; `static.js` already holds all static data
- Translation keys in `translations.js` — prompts are long multi-line texts better suited as structured objects than flat translation keys

## 5. Saved Insights Storage

### Decision: Dedicated localStorage key `local-mood-tracker-ai-insights`

**Rationale**: Constitution VIII requires insights to be stored separately from entry data. A dedicated key keeps the data model clean and allows independent export/import of insights.

### Storage format

```json
{
  "ins_20260418_143052123": {
    "id": "ins_20260418_143052123",
    "type": "reflection",
    "text": "...",
    "model": "llama3.2",
    "createdAt": "2026-04-18T14:30:52.123Z",
    "linkedEntryKey": "2026-04-18_143000000",
    "lang": "en"
  }
}
```

- `linkedEntryKey` is `null` for unlinked insights (trend, summary)
- Key format uses `ins_` prefix + timestamp to avoid collisions with entry keys

**Alternatives considered**:
- Store inside entry objects — violates Constitution VIII guardrails
- IndexedDB — violates Constitution I (localStorage-only constraint)

## 6. Module Architecture

### Decision: Single `MCI.AI` module

**Rationale**: One module handles all AI functionality: LLM communication, prompt construction, response rendering, insight storage, and configuration UI. This follows the existing pattern (one module per feature). The module subscribes to bus events and never calls other modules directly.

### Events

| Event | Emitted by | Payload |
|-------|-----------|---------|
| `ai:response` | MCI.AI | `{ type, text, model, duration }` |
| `ai:error` | MCI.AI | `{ message }` |
| `ai:status` | MCI.AI | `{ available: boolean, model: string }` |
| `insight:saved` | MCI.AI | `{ key, insight }` |
| `insight:deleted` | MCI.AI | `{ key }` |

### Dependencies on existing modules (via bus only)

- Listens to `settings:changed` for LLM config updates
- Listens to `language:changed` for prompt language switching
- Listens to `entry:deleted` to update linked insight references
- Reads entries via `MCI.loadEntries()` (core helper, allowed)
- Reads settings via `MCI.loadSettings()` (core helper, allowed)
