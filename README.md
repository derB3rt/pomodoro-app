# 🍅 Pomodoro-App

React + Vite + Tailwind CSS + Supabase · Deployed auf GitHub Pages

## Setup

### 1. Supabase einrichten

1. Im [Supabase Dashboard](https://supabase.com) ein neues Projekt anlegen
2. Unter **SQL Editor** → `supabase-setup.sql` ausführen
3. Unter **Project Settings → API** folgende Werte kopieren:
   - `Project URL`
   - `anon public` Key

### 2. Lokale Entwicklung

```bash
npm install
cp .env.example .env
# .env befüllen:
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
npm run dev
```

### 3. vite.config.js anpassen

```js
base: '/DEIN-REPO-NAME/',
```

### 4. GitHub Secrets hinterlegen

Unter **Repository → Settings → Secrets and variables → Actions**:

| Secret | Wert |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

### 5. GitHub Pages aktivieren

**Repository → Settings → Pages → Source:** `GitHub Actions`

Beim nächsten Push auf `main` wird automatisch deployed.

## Datenschutzhinweis

Die App speichert eine zufällige `device_id` im localStorage des Browsers,
um Daten geräteübergreifend zu trennen – ohne Login. Es werden keine
personenbezogenen Daten gespeichert.
