# The Guide

A phone-first progressive web app that behaves like a handheld electronic field guide to Earth — not a chatbot.

**Live:** [https://earth-guide-nu.vercel.app](https://earth-guide-nu.vercel.app)

## What it does

- Opens like a plastic field terminal (`DON'T PANIC`)
- Looks up subjects or questions as compact Guide entries
- Dry editorial voice via structured OpenAI Responses output
- Follow-ups append supplementary notes (no chat bubbles)
- Saves bookmarks and recent entries in `localStorage`
- Local entry (GPS), Identify (camera/upload), Surprise Me, read aloud
- Installable PWA with offline shell for saved browsing

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- OpenAI Responses API (structured JSON)
- Vercel hosting
- No accounts, no database, no social features

## Screens

1. Cover — `/` and `/cover`
2. Index — `/guide`
3. Entry — `/entry/[id]`
4. Saved — `/saved`
5. Identify — `/identify`

## Setup

```bash
npm install
cp .env.example .env.local
# set OPENAI_API_KEY
npm run dev
```

Production needs `OPENAI_API_KEY` in the Vercel project environment.

## API

- `POST /api/entry` — text lookup / surprise topic
- `POST /api/follow-up` — supplementary note
- `POST /api/identify` — image identification
- `POST /api/local-entry` — place entry from coordinates + place name
