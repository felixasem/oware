# Deploying Oware to Hostinger (Shared Hosting)

This deploys the **single-player game** as a static site. No Node.js server is
needed — the game logic and AI run entirely in the browser.

> Multiplayer is disabled in this build because shared hosting can't run the
> Socket.io backend. See the bottom of this file to enable it later.

---

## What gets uploaded

The build output is the folder:

```
oware-game/client/out/
```

Everything inside `out/` is plain HTML/CSS/JS. A ready-made zip is also created at:

```
oware-game/client/oware-site.zip
```

---

## Step 1 — Build (already done, but here's how to rebuild)

```bash
cd oware-game/client
npm install        # first time only
npm run build      # produces the out/ folder
```

To regenerate the upload zip after a rebuild (PowerShell):

```powershell
cd oware-game/client
Compress-Archive -Path "out\*" -DestinationPath "oware-site.zip" -Force
```

---

## Step 2 — Upload to Hostinger (hPanel File Manager)

1. Log in to **Hostinger → hPanel**.
2. Open **Files → File Manager**.
3. Go into the **`public_html`** folder of your domain.
   - If you're putting the game on the main domain, this is the root `public_html`.
   - For a subdomain (e.g. `oware.yourdomain.com`), create the subdomain first
     under **Domains → Subdomains**, then open its folder.
4. *(Optional)* Delete any existing placeholder files (like `default.php`).
5. Click **Upload Files**, select **`oware-site.zip`**, and upload it.
6. Right-click the uploaded `oware-site.zip` → **Extract** → extract into the
   current folder (`public_html`).
7. Confirm `index.html` now sits directly inside `public_html`
   (NOT inside a nested `out/` folder). If it landed in a subfolder, move the
   contents up one level.
8. Delete `oware-site.zip` to keep things tidy.

### Alternative — FTP upload
Use FileZilla with the FTP credentials from **hPanel → Files → FTP Accounts**,
then drag the **contents of `out/`** (not the folder itself) into `public_html`.

---

## Step 3 — Visit your site

Open `https://yourdomain.com` (or your subdomain). The Oware menu should load
and "vs Computer" should be playable immediately.

Hostinger provides free SSL — enable it under **Security → SSL** if it isn't
already active.

---

## Updating the game later

1. Make your code changes.
2. `npm run build` again.
3. Re-zip and re-upload `out/`, replacing the old files in `public_html`.

---

## (Later) Enabling multiplayer

Multiplayer needs the `server/` backend running as a persistent Node process
with WebSocket support — which shared hosting can't provide. Options:

1. **Hostinger VPS** — run the backend with PM2 + nginx reverse proxy.
2. **Free/cheap external host** for just the backend (Render, Railway, Fly.io).

Once the backend is live at a public HTTPS URL, rebuild the frontend with:

```bash
# .env.local in oware-game/client
NEXT_PUBLIC_SERVER_URL=https://your-backend-url
NEXT_PUBLIC_ENABLE_MULTIPLAYER=true
```

Then `npm run build` and re-upload. The Multiplayer button will reappear.

> Important: if your site is HTTPS, the backend must also be HTTPS (wss://),
> or browsers will block the WebSocket connection as mixed content.
