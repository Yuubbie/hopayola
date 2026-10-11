# PlotReply

WhatsApp inbox for Nigerian agents and short-let hosts: qualify, match listings, book inspections or dates. Never collect payment in chat.

## Run locally

```bash
cd plotreply
npm install
npm run dev
```

Open **http://127.0.0.1:3200** (not 3100, not https). On this Windows setup the production server on 3200 responds; `localhost:3100` can hang.

- `/` landing
- `/demo` talk to the bot (seed Lagos / Abuja / PH listings)
- `/onboard` self-serve listing form
- `/dashboard` listing list
- `POST /api/chat` bot
- `GET|POST /api/whatsapp` Meta Cloud API webhook

## WhatsApp (when you have a Cloud API number)

1. Meta app → WhatsApp → webhook `https://YOUR_DOMAIN/api/whatsapp`
2. Verify token = `WHATSAPP_VERIFY_TOKEN`
3. Set `WHATSAPP_TOKEN` on Vercel

Until Meta is connected, ship the **demo inbox** — same bot logic.

## Stack

Vercel + (next) Supabase. This v1 runs without Supabase so you can deploy today.
