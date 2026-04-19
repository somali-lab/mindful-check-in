# Data Model: Local LLM Insights

**Feature**: 002-local-llm-insights
**Date**: 2026-04-18

## Entities

### 1. LLM Configuration (extends existing Settings)

Added to the existing `local-mood-tracker-settings` object.

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `aiEndpoint` | string | `"http://localhost:11434"` | Must start with `http://localhost` or `http://127.0.0.1` |
| `aiModel` | string | `""` | Free text; populated by model discovery |
| `aiTemperature` | number | `0.7` | Range 0.0–2.0, step 0.1 |
| `aiEnabled` | boolean | `false` | Controls whether AI features are visible in the UI |

**Validation rules**:
- `aiEndpoint` MUST resolve to a localhost address. Any non-localhost URL MUST be rejected at save time.
- `aiModel` empty string means "use default model" (Ollama will use the first available model).
- `aiTemperature` clamped to `[0.0, 2.0]`.

**State transitions**: None — configuration is static user preferences.

---

### 2. Prompt Template (static data in `MCI.Data.aiPrompts`)

Not persisted — defined as code in `data/static.js`.

| Field | Type | Description |
|-------|------|-------------|
| `system` | `{ en: string, nl: string }` | System prompt defining the LLM persona and rules |
| `user` | `{ en: string, nl: string }` | User message template with `{placeholder}` tokens |

**Template types**: `reflection`, `trend`, `action`, `summary`

**Placeholder tokens** (substituted at request time):

| Token | Available in | Content |
|-------|-------------|---------|
| `{entryData}` | reflection | JSON summary of the single entry |
| `{entrySummary}` | trend, action, summary | Aggregated data across the selected period |
| `{periodLabel}` | trend, action, summary | Human-readable period description (e.g. "last 7 days") |
| `{entryCount}` | trend, action, summary | Number of entries in the period |
| `{lang}` | all | Active language code (`en` or `nl`) |

---

### 3. Analysis Request (transient — never persisted)

Constructed in memory when the user triggers an analysis.

| Field | Type | Description |
|-------|------|-------------|
| `type` | enum | `"reflection"`, `"trend"`, `"action"`, `"summary"` |
| `entries` | Entry[] | Selected entry or entries for analysis |
| `lang` | string | Active language at request time |
| `model` | string | Model name from settings |
| `endpoint` | string | Endpoint URL from settings |
| `temperature` | number | Temperature from settings |

---

### 4. LLM Response (transient — ephemeral by default)

Returned by the LLM and held in module-scoped variable until dismissed or saved.

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Analysis type that produced this response |
| `text` | string | The LLM-generated content (escaped before rendering) |
| `model` | string | Model name used |
| `duration` | number | Total response time in milliseconds |
| `tokenCount` | number | `eval_count` from Ollama response |
| `createdAt` | string | ISO 8601 timestamp |
| `entryKey` | string or null | Entry key if this was a single-entry reflection |

---

### 5. Saved Insight (persisted in `local-mood-tracker-ai-insights`)

Created when the user presses "Save insight" on an ephemeral response.

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `id` | string | auto-generated | Format: `ins_YYYYMMDD_HHMMSSmmm` |
| `type` | enum | — | `"reflection"`, `"trend"`, `"action"`, `"summary"` |
| `text` | string | — | Non-empty; escaped before storage |
| `model` | string | — | Model name that produced the response |
| `createdAt` | string | — | ISO 8601 timestamp |
| `linkedEntryKey` | string or null | `null` | Entry key reference (optional) |
| `lang` | string | — | Language the response was generated in |

**Storage format**: Object of objects keyed by `id`.

```json
{
  "ins_20260418_143052123": {
    "id": "ins_20260418_143052123",
    "type": "reflection",
    "text": "You mentioned tension in your shoulders...",
    "model": "llama3.2",
    "createdAt": "2026-04-18T14:30:52.123Z",
    "linkedEntryKey": "2026-04-18_143000000",
    "lang": "en"
  }
}
```

**State transitions**:
- Created: user saves an ephemeral response
- Deleted: user explicitly deletes from the AI Insights overview
- Link broken: when a linked entry is deleted, `linkedEntryKey` remains but the insight shows "entry deleted" in the UI

**Relationship**: `Saved Insight.linkedEntryKey` → `Entry key` (optional, weak reference — the insight survives entry deletion)

---

## localStorage Keys Summary

| Key | New? | Type | Content |
|-----|------|------|---------|
| `local-mood-tracker-settings` | Existing (extended) | Object | + `aiEndpoint`, `aiModel`, `aiTemperature`, `aiEnabled` |
| `local-mood-tracker-ai-insights` | **New** | Object | Saved AI insights keyed by insight ID |
