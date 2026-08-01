# The Guide

A phone-first progressive web app that behaves like a handheld electronic field guide to Earth — not a chatbot.

Look up subjects or questions, receive compact editorial **Guide entries**, save useful ones locally, identify things from photos, and ask for clarifying notes without turning the product into a chat thread.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- OpenAI Responses API with structured JSON output
- localStorage for recent/saved entries
- Installable PWA (manifest + offline shell)

No accounts, database, or social features in v1.

## Setup

```bash
npm install
cp .env.example .env.local
# add OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Screens

1. **Cover** — `DON'T PANIC`, tap to open; optional skip on later launches
2. **Index** — lookup, local entry, identify, surprise me, recent entries
3. **Entry** — verdict, body, notes, caution, see also, sources, follow-up, save, read aloud
4. **Saved** — personal bookmark library on-device
5. **Identify** — camera/upload → Guide entry with confidence

## API routes

- `POST /api/entry` — text lookup / surprise topic
- `POST /api/follow-up` — supplementary note for an entry
- `POST /api/identify` — image identification
- `POST /api/local-entry` — place entry from coordinates + place name

## Deploy

Deploy to Vercel (or Cloudflare Pages with Next support). Set `OPENAI_API_KEY` in the host environment. Users can install the app to their home screen from a supporting mobile browser.
