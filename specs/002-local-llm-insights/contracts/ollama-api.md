# Ollama API Contract

**Feature**: 002-local-llm-insights
**Date**: 2026-04-18
**Source**: https://github.com/ollama/ollama/blob/main/docs/api.md

This document defines the subset of the Ollama HTTP API that the app consumes. The app MUST NOT call endpoints outside this contract.

---

## Base URL

Default: `http://localhost:11434`
Configurable by the user in Settings (`aiEndpoint`).
MUST resolve to `localhost` or `127.0.0.1`.

---

## 1. Chat Completion

**Purpose**: Send check-in data for AI analysis
**Used by**: All analysis types (reflection, trend, action, summary)

```
POST {baseUrl}/api/chat
Content-Type: application/json
```

### Request

```json
{
  "model": "string (required)",
  "messages": [
    {
      "role": "system",
      "content": "string — system prompt defining persona and rules"
    },
    {
      "role": "user",
      "content": "string — entry data and analysis instruction"
    }
  ],
  "stream": false,
  "options": {
    "temperature": 0.7
  }
}
```

### Response (200 OK)

```json
{
  "model": "string",
  "created_at": "string (ISO 8601)",
  "message": {
    "role": "assistant",
    "content": "string — the generated insight text"
  },
  "done": true,
  "total_duration": 5191566416,
  "load_duration": 2154458,
  "prompt_eval_count": 26,
  "prompt_eval_duration": 383809000,
  "eval_count": 298,
  "eval_duration": 4799921000
}
```

### Error handling

| Status | Meaning | App behaviour |
|--------|---------|---------------|
| 200 + `done: true` | Success | Extract `message.content`, display with disclaimer |
| 200 + empty `message.content` | Empty response | Show "Could not generate a response" message |
| 404 | Model not found | Show "Model not found — check your settings" |
| 500 | Server error | Show generic "LLM error — try again" message |
| Network error | Ollama not running | Show "LLM unavailable — is Ollama running?" |
| Timeout (30s) | Slow model | Abort fetch, show "Request timed out — try a smaller model" |

---

## 2. List Models

**Purpose**: Discover available models for Settings dropdown
**Used by**: "Discover models" button in Settings

```
GET {baseUrl}/api/tags
```

### Response (200 OK)

```json
{
  "models": [
    {
      "name": "llama3.2:latest",
      "model": "llama3.2:latest",
      "size": 2019393189,
      "details": {
        "family": "llama",
        "parameter_size": "3.2B",
        "quantization_level": "Q4_K_M"
      }
    }
  ]
}
```

### Fields used by the app

| Field | Usage |
|-------|-------|
| `models[].name` | Display name and value for model selection dropdown |
| `models[].details.parameter_size` | Display alongside model name (e.g. "llama3.2 (3.2B)") |
| `models[].details.family` | Informational display |

---

## 3. Version Check

**Purpose**: Verify Ollama is running (connection test)
**Used by**: "Test connection" button in Settings, startup availability check

```
GET {baseUrl}/api/version
```

### Response (200 OK)

```json
{
  "version": "0.5.1"
}
```

### Error handling

| Status | Meaning | App behaviour |
|--------|---------|---------------|
| 200 | Ollama running | Show green status indicator + version number |
| Network error | Not running | Show red status indicator + setup instructions |

---

## CORS Notes

- Ollama sets `Access-Control-Allow-Origin: *` by default
- The app MUST be served via a local web server (not `file://`) for `fetch` to work
- No additional CORS configuration is needed on the Ollama side
