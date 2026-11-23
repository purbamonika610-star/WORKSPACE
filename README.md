# MONIKA WORKSPACE

Personal productivity & project dashboard: 4 projects (Career, Elevara, Sister's business, Personal brand),
calendar with color categories + reminders, two-way Google Calendar sync, and a Social Media hub
(daily trend research, idea inbox, per-slide carousel scripts + captions, auto-scheduled design/edit/post sessions,
Instagram feed preview). Bilingual EN / ID.

## Run on your laptop
1. Install Node.js 20+ from https://nodejs.org
2. In this folder: `npm install` then `npm run dev`
3. Open http://localhost:5173

## Build for hosting (Vercel / Netlify)
`npm run build` → upload the `dist` folder (or connect the repo; build command `npm run build`, output `dist`).

## Google Calendar (one time)
Settings → Google Calendar sync → follow "How to get a Client ID". Add your app URL
(e.g. http://localhost:5173 or your Vercel URL) as an Authorized JavaScript origin.

## AI (optional)
Settings → paste an Anthropic API key (console.anthropic.com). Without it the inbox uses built-in templates.
Daily trend research uses web search and runs once a day when you open the Social Media page.

Data is saved in your browser (localStorage + IndexedDB for Canva images). Use Settings → Download backup regularly.
