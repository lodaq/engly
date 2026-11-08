# Engly

A bilingual English coach based on the attached **AI English Tutor Masterclass Summary**. Built with React, Vite, and a small Node server. The source describes the learning experience rather than supplying the original app or screenshots, so this is a complete implementation of that flow with an original interface.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. Progress and drafts are saved in this browser. Use **Settings → Export progress** to back up a learner profile, or restore a previously exported JSON backup. Resetting progress asks for confirmation.

## Enable Gemini

The app works immediately with built-in practice. For fresh lessons and detailed bilingual AI assessment:

1. Copy `.env.example` to `.env`.
2. Set `GEMINI_API_KEY` to your Google Gemini API key.
3. Restart the server.

`GEMINI_MODEL` defaults to `gemini-2.5-flash`. `PORT` defaults to `5173`. The server keeps the key private and validates requests and structured model responses. Submitted answers and the learner’s level/focus areas are sent to Google only when using AI. Browser speech recognition may use the browser vendor’s speech service.

The server listens on `127.0.0.1` by default. Set `HOST=0.0.0.0` when you intentionally need network access. This is a local, single-browser learning app: before a public multi-user deployment, add authentication and per-user usage limits to protect your Gemini quota.

## Learning flow

- **Placement:** 12 grammar, vocabulary, and reading questions followed by open-ended writing. Retakes choose different built-in questions; Gemini can generate original questions. Finishing unlocks all skills and provides an English/Arabic diagnostic.
- **Today’s mission:** three tasks totalling 25 planned minutes, a pauseable focus timer, and daily completion tracking.
- **Reading:** level-matched passages, highlighted vocabulary, pronunciation, an English/Arabic dictionary, comprehension questions, and an original-sentence exercise.
- **Writing:** practical emails, proposals, and other level-matched tasks, persistent drafts, and correction feedback.
- **Listening:** browser text-to-speech, playback speeds, optional transcripts, comprehension summaries, and trusted external resources.
- **Speaking:** a café roleplay, native speech recognition where supported, and a typed/pasted transcript fallback. Feedback assesses text, not pronunciation.
- **Progress:** measured skill scores, practice history, time spent in each lesson, streaks, and focus areas supplied to future AI exercises.
- **Demo:** a temporary B1 profile. Its activity never replaces the learner’s real saved progress.

Without Gemini, a short question-based placement estimate and limited rule-based writing checks are available. Basic checks explicitly carry no AI score. Built-in lessons repeat; AI generates new content and evaluates open-ended answers. Placement results are provisional practice guidance, not certified CEFR assessments. Listening/speaking scores stay empty until an AI-reviewed task is completed; speaking scores refer to transcripts.

## Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The browser tests cover placement gating/results/persistence, reading and dictionary interaction, demo isolation, writing drafts/corrections, listening, speaking transcript entry, the focus timer, AI error recovery, and mobile navigation. If you already have Chromium installed, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path.

Live Gemini calls require a real key. Microphone permission and audible speech output require manual verification on the target browser/device. Native speech recognition works only in supporting browsers and requires localhost or HTTPS.

## Production build

```sh
npm run build
npm start
```

The same Node server serves the built frontend and `/api/tutor`. No API key is bundled in the client. Frontend-only static hosting does not provide the Gemini endpoint.
