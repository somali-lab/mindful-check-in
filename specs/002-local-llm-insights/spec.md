# Feature Specification: Local LLM Insights

**Feature Branch**: `002-local-llm-insights`
**Created**: 2026-04-18
**Status**: Draft
**Input**: User description: "Lokale LLM integratie (bijv. Ollama) die ingevulde check-ins beoordeelt — per sessie en over een periode — met reflecties, trendanalyse, actiesuggesties en samenvattingen."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Single Check-in Reflection (Priority: P1)

A user has just saved a check-in. They want to understand what they wrote and feel on a deeper level. They press an "Ask AI" button and receive reflective questions and observations based on their entry — for example: "You mentioned tension in your shoulders and low mental energy. What do you think might be contributing to that?"

**Why this priority**: This is the simplest, most immediately useful interaction. It works with a single entry and requires no historical data, making it the core MVP.

**Independent Test**: Can be fully tested by saving one check-in, pressing "Ask AI", and verifying that a contextual reflection appears in the response area with a visible disclaimer.

**Acceptance Scenarios**:

1. **Given** a saved check-in with at least one filled field, **When** the user presses "Ask AI" on the check-in screen, **Then** the system sends the entry data to the local LLM and displays a reflection within the check-in view.
2. **Given** a saved check-in, **When** the LLM returns a response, **Then** a disclaimer is visible stating this is not medical advice and the LLM is not a therapist.
3. **Given** a saved check-in, **When** the user has not configured an LLM endpoint or the LLM is unavailable, **Then** the "Ask AI" button shows a clear "unavailable" state and pressing it explains how to set up a local LLM.
4. **Given** a saved check-in, **When** the user presses "Ask AI", **Then** a loading indicator is shown while waiting for the LLM response.
5. **Given** a check-in with no fields filled, **When** the user presses "Ask AI", **Then** the system informs the user there is not enough data to reflect on.

---

### User Story 2 — Trend Analysis over a Period (Priority: P2)

A user wants to understand patterns in their well-being over time. They select a time period (last 7 days, last 2 weeks, last month, or a custom range) and request a trend analysis. The LLM identifies recurring patterns in mood, energy levels, body signals, and emotions — for example: "Your mental energy has been below 30% for 5 consecutive days, and tension in the neck area appeared in 4 of those entries."

**Why this priority**: Trend detection is the highest-value multi-session feature. It surfaces insights the user would not easily spot by scrolling through individual entries.

**Independent Test**: Can be tested by loading demo data (30 entries), selecting "Last month", pressing "Analyse trends", and verifying the response references patterns across multiple entries.

**Acceptance Scenarios**:

1. **Given** at least 3 entries in the selected period, **When** the user selects a period and presses "Analyse trends", **Then** the system sends aggregated entry data to the LLM and displays identified patterns.
2. **Given** fewer than 3 entries in the selected period, **When** the user presses "Analyse trends", **Then** the system informs them there is not enough data for meaningful analysis.
3. **Given** a valid period with entries, **When** the LLM responds, **Then** the response references specific data points (dates, values, emotions) found in the entries.
4. **Given** a valid period, **When** the analysis is in progress, **Then** a loading indicator and a "Cancel" option are visible.

---

### User Story 3 — Action Suggestions Based on History (Priority: P3)

A user is in a low-energy or negative-mood period and wants actionable ideas. They request suggestions and the LLM looks at what the user did previously in similar situations and what seemed to help — for example: "The last time you experienced this pattern, you noted 'went for a walk' and your energy improved the next day. Consider trying that again."

**Why this priority**: Builds on trend analysis (P2) by adding a forward-looking, actionable dimension. Requires historical correlation logic.

**Independent Test**: Can be tested with demo data containing varied entries. Request action suggestions and verify the response references previous entries where actions led to measurable improvement.

**Acceptance Scenarios**:

1. **Given** at least 7 entries with actions recorded, **When** the user requests action suggestions, **Then** the LLM references specific past entries where actions correlated with improvement.
2. **Given** entries without any actions recorded, **When** the user requests action suggestions, **Then** the system explains it needs more entries with actions filled in to provide useful suggestions.
3. **Given** a valid history, **When** the LLM responds with suggestions, **Then** each suggestion is presented as a concrete, actionable recommendation — not a generic self-help platitude.

---

### User Story 4 — Period Summary (Priority: P4)

A user wants a concise, human-readable summary of their past week or month — suitable for sharing with a therapist, partner, or for personal journaling. They select a period and receive a natural-language narrative summarising their emotional journey, energy trends, and notable events.

**Why this priority**: Valuable but lower urgency — it synthesises what the user already has access to. Nice complement to the other features.

**Independent Test**: Can be tested with demo data. Request a summary for "Last month" and verify the output is a coherent narrative covering mood, energy, body, and actions.

**Acceptance Scenarios**:

1. **Given** at least 5 entries in the selected period, **When** the user requests a period summary, **Then** the system generates a natural-language narrative covering mood, energy, body signals, and actions.
2. **Given** a generated summary, **When** the user wants to keep it, **Then** they can copy the summary text to their clipboard.
3. **Given** a generated summary, **When** the user presses "Save insight", **Then** the response is stored as a saved insight (not in entry data) and remains accessible in the AI Insights overview.
4. **Given** a generated summary, **When** displayed, **Then** the disclaimer is visible.

---

### User Story 5 — LLM Configuration (Priority: P5)

A user installs Ollama and wants to connect it to the app. They go to Settings, enter the endpoint URL, select a model from a discovered list, and test the connection.

**Why this priority**: Configuration is a prerequisite but not the primary value. It enables all other stories.

**Independent Test**: Can be tested by opening Settings, entering a valid Ollama endpoint, pressing "Test connection", and verifying the status indicator changes.

**Acceptance Scenarios**:

1. **Given** the Settings screen, **When** the user navigates to the AI section, **Then** they see fields for endpoint URL, model name, and a connection test button.
2. **Given** a valid Ollama endpoint, **When** the user presses "Test connection", **Then** the system verifies connectivity and shows a success indicator with the model name.
3. **Given** an unreachable endpoint, **When** the user presses "Test connection", **Then** a clear error message explains the LLM is not reachable and suggests checking if Ollama is running.
4. **Given** a valid endpoint, **When** the user presses "Discover models", **Then** the app lists available models from the LLM and allows selection.
5. **Given** saved LLM settings, **When** the app starts, **Then** it silently checks LLM availability and updates the status indicator without blocking the UI.

---

### User Story 6 — Save & Review AI Insights (Priority: P6)

After receiving any LLM response (reflection, trend, suggestion, or summary), the user decides this insight is valuable and presses a "Save insight" button. The insight is stored separately from entry data. They can optionally link it to a specific check-in entry. Later, the user browses their saved insights in a dedicated overview — filtered by type, date, or linked entry.

**Why this priority**: Builds on all other stories. Without the core AI interactions (P1–P4), there is nothing to save.

**Independent Test**: Can be tested by triggering an AI reflection (P1), pressing "Save insight", optionally linking it to the current entry, then navigating to the AI Insights overview and verifying the saved insight appears with its metadata.

**Acceptance Scenarios**:

1. **Given** a displayed LLM response of any type, **When** the user presses "Save insight", **Then** the response text, type, date, model name, and disclaimer are stored in a dedicated localStorage key (separate from entries).
2. **Given** a displayed LLM response triggered from a specific check-in, **When** the user presses "Save insight", **Then** they are offered the option to link it to that entry (by entry key). Linking is optional.
3. **Given** saved insights exist, **When** the user opens the AI Insights overview, **Then** they see a chronological list of saved insights with type, date, and linked entry (if any).
4. **Given** a saved insight linked to an entry, **When** the user clicks the link, **Then** the corresponding check-in entry is loaded.
5. **Given** a saved insight, **When** the user presses "Delete", **Then** the insight is removed from storage after confirmation.
6. **Given** no saved insights, **When** the user opens the AI Insights overview, **Then** an empty state message explains the feature.

---

### Edge Cases

- What happens when the LLM returns an empty or malformed response? → Show a user-friendly error ("Could not generate a response — try again or check your LLM setup").
- What happens when the LLM takes longer than 30 seconds? → Timeout with a clear message and option to retry.
- What happens when the user switches language (EN ↔ NL) while an LLM response is displayed? → The disclaimer updates immediately; the LLM response text remains in its original language (the LLM generates in the app's active language at request time).
- What happens when entries contain very little data (e.g. only a mood score)? → The LLM adapts its reflection to available data; the system does not refuse analysis for partial entries (unless completely empty).
- What happens when the user has hundreds of entries and selects "All time"? → The system summarises or samples entries before sending to the LLM to stay within token limits. The user is informed if summarisation was applied.
- What happens when a CORS issue blocks the fetch to localhost? → Clear error message explaining the issue and suggesting the user serve the app via a local web server.
- What happens when the LLM response contains HTML or script tags? → All LLM output is escaped before rendering (XSS prevention per Constitution III).
- What happens when the user saves an insight linked to an entry, then later deletes that entry? → The insight remains but the link is shown as "entry deleted". The insight is not auto-deleted.
- What happens when localStorage is near its quota limit and the user tries to save an insight? → Graceful degradation with a warning message (per Constitution III).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an "Ask AI" action on the check-in screen that sends the current entry to a locally-running LLM and displays a reflective response.
- **FR-002**: The system MUST provide a "Trend analysis" action that analyses entries across a user-selected time period and returns identified patterns.
- **FR-003**: The system MUST provide an "Action suggestions" feature that correlates past actions with subsequent mood/energy improvements and presents actionable recommendations.
- **FR-004**: The system MUST provide a "Period summary" feature that generates a natural-language narrative for a selected date range.
- **FR-005**: The system MUST display a disclaimer alongside every LLM-generated response stating the output is not medical advice and the LLM is not a therapist.
- **FR-006**: The system MUST allow the user to configure the LLM endpoint URL, model name, and temperature in Settings.
- **FR-007**: The system MUST provide a "Test connection" button in Settings that verifies LLM availability and displays the result.
- **FR-008**: The system MUST provide a "Discover models" action that lists available models from the configured LLM endpoint.
- **FR-009**: The system MUST show a status indicator (connected / unavailable) reflecting current LLM availability.
- **FR-010**: All AI features MUST be entirely optional — the app MUST function fully without any LLM configured or running.
- **FR-011**: The system MUST NOT send data to the LLM without explicit user action (no background or automatic sends).
- **FR-012**: LLM responses are ephemeral by default. The user MAY choose to save individual responses via a "Save insight" action. Saved insights MUST be stored in a dedicated localStorage key, separate from entry data. Insights MUST NOT be embedded in or modify entry objects.
- **FR-013**: The system MUST escape all LLM output before rendering to prevent XSS.
- **FR-014**: The system MUST handle LLM errors, timeouts (30 second maximum), and malformed responses gracefully with user-friendly messages.
- **FR-015**: The system MUST show a loading indicator with a cancel option during LLM requests.
- **FR-016**: Prompt templates MUST be defined in a dedicated data file (translatable and auditable), not hard-coded in module logic.
- **FR-017**: All user-visible text (buttons, labels, disclaimers, error messages) MUST be translatable in both English and Dutch.
- **FR-018**: The LLM MUST receive the prompt in the app's currently active language so responses match the user's language preference.
- **FR-019**: When the selected period contains too many entries to fit within a reasonable token budget, the system MUST summarise or sample the data and inform the user.
- **FR-020**: The system MUST allow the user to copy LLM-generated summaries to the clipboard.
- **FR-021**: The system MUST only communicate with `localhost` endpoints — cloud-hosted AI endpoints are forbidden.
- **FR-022**: The system MUST allow the user to optionally link a saved insight to a specific check-in entry. The link is a reference (entry key), not a copy of entry data.
- **FR-023**: The system MUST provide an AI Insights overview where saved insights can be browsed, filtered by type and date, and deleted.
- **FR-024**: When an entry linked to a saved insight is deleted, the insight MUST remain accessible with an indication that the linked entry no longer exists.

### Key Entities

- **LLM Configuration**: Endpoint URL, model name, temperature, availability status. Stored in user settings.
- **Prompt Template**: A predefined text structure with placeholders for entry data, used to construct the LLM request. One template per analysis type (reflection, trend, action, summary). Defined per language.
- **LLM Response**: Text returned by the LLM. Ephemeral by default. Contains the generated insight plus metadata (model used, response time).
- **Saved Insight**: An LLM response the user chose to keep. Contains: response text, analysis type (reflection / trend / action / summary), creation date, model name, disclaimer text, and an optional linked entry key. Stored in a dedicated localStorage key separate from entries.
- **Analysis Request**: The combination of selected entries, analysis type, active language, and prompt template that forms the LLM request payload.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can receive a single-entry reflection within 15 seconds of pressing "Ask AI" (assuming LLM is running and responsive).
- **SC-002**: Users can identify at least one previously unnoticed pattern after running trend analysis on 2+ weeks of entries.
- **SC-003**: 100% of LLM responses are accompanied by a visible disclaimer.
- **SC-004**: The app remains fully functional (all existing features operational) when no LLM is configured or available.
- **SC-005**: Connection test provides a clear pass/fail result within 5 seconds.
- **SC-006**: All AI-related UI text is available in both English and Dutch.
- **SC-007**: Zero user data is transmitted to any non-localhost endpoint.
- **SC-008**: Saved insights remain accessible and intact after the linked entry is deleted.

## Assumptions

- The user is responsible for installing and running a local LLM (e.g. Ollama) on their machine. The app does not manage the LLM lifecycle.
- Ollama's HTTP API (or compatible) is the primary integration target. The app uses standard HTTP `fetch` to communicate.
- The local LLM supports an OpenAI-compatible chat completion endpoint (`/api/chat` for Ollama or `/v1/chat/completions`).
- The app is served via a local web server (e.g. `npx serve`) when using AI features, to avoid CORS issues with `file://` origins. This is documented per Constitution II.
- A model with at least 7B parameters is recommended for useful reflections; the app does not enforce minimum model size.
- Token limits vary per model. The app targets a maximum context of ~4000 tokens per request, summarising entry data if needed.
- Response quality depends on the chosen model. The app makes no guarantees about clinical accuracy or therapeutic value.
