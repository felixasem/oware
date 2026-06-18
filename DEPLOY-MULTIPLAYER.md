# Enabling Multiplayer (Backend Deployment)

The single-player game runs as static files on Hostinger. **Multiplayer** needs
the `server/` (Express + Socket.io) running as a live Node process with
WebSocket support — which Hostinger shared hosting can't provide.

The plan: host the **backend** for free on **Render** (recommended) or Railway,
then rebuild the **frontend** to point at it and re-upload to Hostinger.

```
  Browser ──HTTPS──> Hostinger (static frontend, public_html)
     │
     └──WSS (WebSocket)──> Render/Railway (Node backend)
```

---

## Part A — Deploy the backend to Render (free)

Render's free tier supports WebSockets. Note: free services **spin down after
~15 min idle** and take ~30s to wake on the next request (fine for casual play).

### 1. Put the project on GitHub
Render deploys from a Git repo.

```bash
cd oware-game
git init
git add .
git commit -m "Oware game"
# Create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/oware-game.git
git branch -M main
git push -u origin main
```

### 2. Create the service on Render
Easiest — use the included blueprint (`render.yaml`):

1. Go to **https://render.com** → sign up (free) → **New + → Blueprint**.
2. Connect your GitHub and select the `oware-game` repo.
3. Render reads `render.yaml` and creates the **oware-server** web service.
4. Click **Apply**. Wait for the build + deploy to finish.

**Or** set it up manually (**New + → Web Service**):
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/health`
- Instance Type: Free

### 3. Get your backend URL
After deploy, Render gives you a URL like:

```
https://oware-server-xxxx.onrender.com
```

Test it: visiting `https://oware-server-xxxx.onrender.com/health` should return
`{"ok":true}`.

### 4. Lock down CORS (recommended)
In Render → your service → **Environment**, add:

| Key | Value |
|---|---|
| `FRONTEND_URL` | `https://yourdomain.com` |

(Use your real Hostinger domain. Comma-separate multiple, e.g.
`https://yourdomain.com,https://www.yourdomain.com`.) Save → it redeploys.

---

## Part B — Point the frontend at the backend, rebuild, re-upload

### 1. Create `oware-game/client/.env.local`

```env
NEXT_PUBLIC_SERVER_URL=https://oware-server-xxxx.onrender.com
NEXT_PUBLIC_ENABLE_MULTIPLAYER=true
```

> Use your real Render URL. It **must be HTTPS** — an HTTPS Hostinger site can't
> open a WebSocket to an insecure (`http://`) backend; the browser blocks it.

### 2. Rebuild the static site

```bash
cd oware-game/client
npm run build
```

### 3. Re-upload to Hostinger
Re-zip and upload `out/` into `public_html` (same as the single-player deploy —
see `DEPLOY-HOSTINGER.md`). The **Multiplayer** button will now appear.

---

## How to play multiplayer
1. One player clicks **Multiplayer → Create Room** → gets a 6-char code.
2. The other enters the code → **Join**.
3. Moves sync in real time; in-room chat works too.

---

## Alternative host — Railway
1. https://railway.app → **New Project → Deploy from GitHub repo**.
2. Set **Root Directory** = `server`.
3. Railway auto-detects Node; it runs `npm run build` then `npm start`.
4. Add a public domain under **Settings → Networking → Generate Domain**.
5. Use that HTTPS URL as `NEXT_PUBLIC_SERVER_URL` and rebuild the frontend.

> Railway no longer has a perpetual free tier (small monthly credit / trial),
> but it doesn't sleep like Render's free tier. Pick based on your needs.

---

## Troubleshooting
- **Button missing** → `NEXT_PUBLIC_ENABLE_MULTIPLAYER=true` must be set *before*
  `npm run build` (env is baked in at build time).
- **"Connecting…" forever / CORS error** → backend URL wrong, backend asleep
  (wait ~30s on Render free), or `FRONTEND_URL` doesn't match your domain.
- **Mixed-content blocked** → backend URL must be `https://`, not `http://`.
- **Moves don't sync** → confirm `/health` responds; check the Render logs.
