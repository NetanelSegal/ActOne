# ActOne – Implementation Status

Single source of truth for what’s done and what’s left. Update this file when you ship or change scope.

---

## Done

### Foundation (Phase 1)

- [x] Root package: scripts `dev`, `dev:client`, `dev:server`, `build`, `start`, `db:migrate`
- [x] Express server: health route, static + SPA fallback in prod
- [x] WebSocket on same HTTP server (`/ws`), echo handler
- [x] PostgreSQL: `server/db/` (getPool, initDb), migrations (`server/db/migrations/`)
- [x] React + Vite client: proxy `/api` and `/ws` to Express in dev
- [x] `.env.example` and README aligned with stack

### Data and Auth (Phase 2)

- [x] Schema: `users`, `scripts` (migration `001_initial.sql`)
- [x] DB layer: `server/db/users.ts`, `server/db/scripts.ts`
- [x] Auth: signup, login, logout, `GET /api/auth/me` (sessions, cookies)
- [x] Script CRUD: `GET/POST /api/scripts`, `GET/PATCH/DELETE /api/scripts/:id` (scoped by user)

### Rehearsal pipeline (Phase 3 – partial)

- [x] Shared: `shared/schemas/api.ts`, `shared/schemas/ws.ts`, `shared/constants.ts`, `shared/types/api.ts`
- [x] STT: `server/lib/gemini-stt.ts` (Gemini audio → transcript)
- [x] WS protocol: event types defined in shared schemas; server still echo-only

### Testing

- [x] Vitest: backend tests (health, auth), frontend test (App), setup with `@testing-library/jest-dom`
- [x] Playwright E2E: `e2e/app.spec.ts` (heading, API health, WebSocket); run `npx playwright install` once

---

## Not done

### Rehearsal pipeline (Phase 3 – rest)

- [ ] **Server:** `server/lib/normalize.ts` (punctuation, lowercase, collapse spaces; Hebrew numbers optional)
- [ ] **Server:** `server/lib/verify.ts` (Levenshtein similarity, thresholds from `shared/constants.ts`)
- [ ] **Server:** `server/ws/` or WS handler in `server/index.ts`: `start_session` (load script, enforce ownership), buffer audio, on end-utterance → Gemini STT → normalize → verify; on pass → OpenAI TTS partner line → send `tts_audio`; on fail → send `verification_fail`; handle “Line” keyword for current-line TTS
- [ ] **Client:** VAD (`@ricky0123/vad-react`), audio capture (getUserMedia, echo cancellation), send chunks over WS
- [ ] **Client:** Rehearsal UI: start session with script id, show current/partner line, pass/fail and optional diff

### Latency and resilience (Phase 4)

- [ ] Latency budget: measure VAD → WS → STT → verify → TTS → playback; target &lt;800ms
- [ ] TTS pre-generation for next 2–3 partner lines
- [ ] Client cache: TTS audio, script lines (memory or IndexedDB)
- [ ] WebSocket reconnect: exponential backoff, persist session state
- [ ] STT fallback (e.g. if Gemini fails)
- [ ] TTS fallback (retry, cached TTS, or show text)

### UI and UX (Phase 5)

- [ ] Script selection: list user scripts, pick one, optional scene/segment
- [ ] Rehearsal view: current user line + partner line, RTL support, listening/correct/wrong state
- [ ] Visual cue on fail: highlight missing/wrong words (diff)
- [ ] No-button flow: VAD-driven end-of-speech only
- [ ] “Line” prompt: say keyword → play current user line, show hint

### Security, privacy, deploy (Phase 6)

- [ ] No audio storage (streaming only); log only similarity + timestamps, max 30 days
- [ ] API keys server-side only; script access enforced everywhere
- [ ] Deploy: single app (Railway / Render / Fly.io), Postgres add-on, env set

---

## Quick reference

| Area       | Done                                  | Next                                                     |
| ---------- | ------------------------------------- | -------------------------------------------------------- |
| Foundation | Express, Vite, WS, DB, client         | —                                                        |
| Auth       | Signup, login, sessions, scripts CRUD | —                                                        |
| Rehearsal  | Gemini STT lib, shared schemas        | Normalize, verify, WS handler, client VAD + rehearsal UI |
| Testing    | Vitest (FE + BE), Playwright E2E      | —                                                        |
| Latency    | —                                     | Budget, pregen, cache, reconnect                         |
| UI         | Minimal App (health, WS)              | Script picker, rehearsal view, cues                      |
| Deploy     | —                                     | Single app + Postgres, env                               |
