# HEKAYATY UNIVERSE 🌙

A premium Arabic fantasy comic & novel platform.

## Architecture

The project is a pnpm monorepo with two main apps:

| App | Path | Description |
|-----|------|-------------|
| **Frontend** | `artifacts/hekayaty-world` | React + Vite + TailwindCSS SPA |
| **Backend API** | `artifacts/api-server` | Express.js REST API |

Both connect to **Supabase** (PostgreSQL + Auth) and **Cloudinary** (media uploads).

---

## Local Development

### Prerequisites
- Node.js 20+
- [pnpm](https://pnpm.io/) installed globally: `npm i -g pnpm`

### Setup

```bash
# 1. Install all dependencies from root
pnpm install

# 2. Set up environment variables
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/hekayaty-world/.env.example artifacts/hekayaty-world/.env.local

# Edit both .env files with your real keys

# 3. Start the API server (port 5000)
cd artifacts/api-server
pnpm run dev

# 4. Start the frontend (port 3000) in another terminal
cd artifacts/hekayaty-world
pnpm run dev
```

The frontend dev server proxies `/api` requests to `http://localhost:5000`.

---

## Deployment

### Frontend → Vercel

The frontend is a static SPA built with Vite. Deploy it to Vercel:

1. **Push** your repo to GitHub.
2. **Import** the repo in [Vercel](https://vercel.com).
3. Set **Root Directory** to: `artifacts/hekayaty-world`
4. Set **Build Command** to: `pnpm run build`  
5. Set **Output Directory** to: `dist/public`
6. Add these **Environment Variables** in Vercel:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-api-server.railway.app` |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |

> ⚠️ The `vercel.json` inside `artifacts/hekayaty-world/` already handles the SPA rewrite rules so all routes (e.g. `/membership`, `/admin`) work correctly.

---

### Backend API → Railway / Render / Fly.io

The Express API server requires a **persistent Node.js host** (NOT Vercel, since it's not serverless-compatible in its current form).

#### Railway (Recommended — Free tier available)
1. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, set **Root Directory** to `artifacts/api-server`
3. Set **Build Command**: `pnpm run build`
4. Set **Start Command**: `pnpm run start`
5. Add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `PORT` | `5000` |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key (**secret!**) |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your api key |
| `CLOUDINARY_API_SECRET` | your api secret (**secret!**) |

6. After deploying, copy your Railway URL (e.g. `https://hekayaty-api.railway.app`) and set it as `VITE_API_BASE_URL` in Vercel.

---

## Security

- **Never commit** `.env` files — they are gitignored.
- Use `.env.example` files as templates only.
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — keep it strictly server-side.
- All admin routes are protected by `requireAuth` + `requireRole` middleware.
- CORS is restricted to the `ALLOWED_ORIGINS` env variable in production.

---

## Environment Variables Reference

### Frontend (`artifacts/hekayaty-world/.env.local`)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (`artifacts/api-server/.env`)
```env
PORT=5000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```
