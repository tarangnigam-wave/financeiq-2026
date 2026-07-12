# Full-Stack Deployment Playbook (Code-Ready Projects)

## How to use this file
Paste this entire file into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) along with the instruction:

> "My frontend is in `/frontend` and my backend is in `/backend` (adjust paths). Follow the playbook below and deploy my app to [PLATFORM NAME]. Ask me only for secrets/API keys — infer everything else from my repo."

This file assumes: your frontend and backend code already exist locally or in a GitHub repo, you have a GitHub account, and you're deploying free/hobby tiers. Each platform section is self-contained — you only need the section for the platform(s) you're actually using.

---

## 0. Pre-Deployment Checklist (do this once, before touching any platform)

- [ ] Push your code to a **GitHub repository** (all platforms below deploy via Git).
- [ ] Confirm your backend reads its port from an environment variable, not a hardcoded value:
  - Node/Express: `const PORT = process.env.PORT || 3000;`
  - Python/Flask: `port = int(os.environ.get("PORT", 5000))`
  - Python/FastAPI (uvicorn): pass `--port $PORT` in the start command
- [ ] Add a `.gitignore` that excludes `node_modules/`, `venv/`, `.env`, `__pycache__/`, `dist/`, `build/`.
- [ ] Move all secrets (API keys, DB URLs) out of code and into a `.env` file — **never commit `.env`**.
- [ ] Create a `.env.example` listing variable names (no values) so the platform's dashboard tells you what to fill in.
- [ ] Confirm your backend has CORS enabled for your frontend's domain (see CORS snippet in Section 6).
- [ ] Note your backend's start command (e.g. `npm start`, `uvicorn main:app`, `gunicorn app:app`) — every platform asks for this.
- [ ] Note your backend's build command if any (e.g. `npm install && npm run build`, `pip install -r requirements.txt`).

---

## 🤖 0.5 Automated Deployment via AI (GitHub MCP & Render API)

You can bypass manual dashboard clicking by asking your AI assistant to deploy for you! 

**Prerequisites:**
1. **GitHub MCP:** Ask the AI to "install the GitHub MCP" so it can interface directly with GitHub.
2. **GitHub API Token (PAT):** You need a Fine-Grained Personal Access Token with `Administration` (Read/Write) and `Contents` (Read/Write) permissions.
3. **Render API Key:** Generate this from your Render Account Settings.

**How to do it:**
Paste your keys to the AI and say: *"Here is my GitHub PAT and Render API Key. Create a new GitHub repository, push my code, and use the Render API to deploy my backend as a Web Service and my frontend as a Static Site. Automatically inject the backend URL into the frontend."* 
The AI will handle the entire CI/CD pipeline setup for you!

---

## 1. Vercel (Frontend — React, Next.js, Vite, static)

**Best for:** React/Next.js/Vite frontends. Also supports lightweight serverless API routes if your "backend" is just a few functions.

1. Go to vercel.com → sign in with GitHub.
2. Click **Add New → Project** → import your repo.
3. Set **Root Directory** to your frontend folder (e.g. `frontend/`) if it's a monorepo.
4. Framework preset is usually auto-detected. If not: build command `npm run build`, output directory `dist` (Vite) or `.next` (Next.js).
5. Add environment variables under **Settings → Environment Variables** (e.g. `VITE_API_URL=https://your-backend-url.com`).
6. Click **Deploy**. You'll get a `https://your-project.vercel.app` URL.
7. Every push to your main branch auto-redeploys.

**Gotcha:** Vercel is not meant for long-running backend servers (Express servers that hold persistent connections, WebSockets, etc.) — use it for frontend + light serverless functions only.

---

## 2. Netlify (Frontend — static, React, Vue, plain HTML/JS)

1. Go to netlify.com → sign in with GitHub.
2. Click **Add new site → Import an existing project** → pick your repo.
3. Set **Base directory** to your frontend folder if monorepo.
4. Build command: `npm run build`. Publish directory: `dist` or `build` (check your framework's output folder).
5. Add environment variables under **Site configuration → Environment variables**.
6. Click **Deploy site**. You'll get a `https://your-project.netlify.app` URL.

**Gotcha:** Netlify is frontend/static-only — it cannot host a persistent backend server. Use it paired with Render/Railway/Koyeb/Fly.io for the backend.

---

## 3. Render (Frontend Static Site + Backend Web Service)

Render can host both halves of your app.

### Backend (Web Service):
1. Go to render.com → sign in with GitHub.
2. **New → Web Service** → connect your repo.
3. Set **Root Directory** to your backend folder (e.g. `backend/`).
4. **Runtime**: auto-detected (Node, Python, Docker, etc.).
5. **Build Command**: e.g. `npm install` or `pip install -r requirements.txt`.
6. **Start Command**: e.g. `node index.js`, `uvicorn main:app --host 0.0.0.0 --port $PORT`.
7. Instance type: **Free**.
8. Add environment variables under the **Environment** tab.
9. Click **Create Web Service**. Note the generated URL, e.g. `https://your-backend.onrender.com`.

### Frontend (Static Site):
1. **New → Static Site** → connect the same repo, set Root Directory to `frontend/`.
2. **Build Command**: `npm run build`. **Publish Directory**: `dist` or `build`.
3. Add env var pointing to your backend, e.g. `VITE_API_URL=https://your-backend.onrender.com`.
4. Click **Create Static Site**.

**Gotcha:** Free web services sleep after ~15 min of inactivity; the first request after sleeping can take 30–60 seconds to wake up. Mention this to end users/testers.

---

## 4. Railway (Full-Stack)

1. Go to railway.app → sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → select your repo.
3. If monorepo, Railway will ask you to set the root directory per service — add two services, one pointed at `backend/`, one at `frontend/` (or deploy frontend separately on Vercel/Netlify and use Railway only for the backend + database).
4. Under each service's **Settings**, set the Start Command if not auto-detected.
5. Add environment variables under **Variables**.
6. Railway auto-generates a public domain under **Settings → Networking → Generate Domain**.

**Gotcha:** Railway no longer has a permanent always-free runtime — it's usage-based with limited trial credit. Check railway.app/pricing before assuming zero cost for an ongoing project; it's still one of the easiest ways to add a managed Postgres/MySQL database alongside your backend.

---

## 5. Koyeb (Backend, container-based)

1. Go to koyeb.com → sign in with GitHub.
2. **Create Web Service → GitHub** → select repo, set the path to your backend folder.
3. Choose the **Free** instance (512 MB RAM, 0.1 vCPU).
4. Set **Build** (Dockerfile auto-detected, or use Koyeb's buildpacks) and **Run Command**.
5. Add environment variables/secrets under the **Environment Variables** section.
6. Set the exposed **Port** to match what your app listens on (e.g. 8000).
7. Deploy. You'll get a `https://your-app.koyeb.app` URL.
8. Optionally attach the free Koyeb PostgreSQL add-on if you need a database.

**Gotcha:** Cold starts happen on the free tier after idling — same wake-up delay caveat as Render.

---

## 6. Fly.io (Backend, Docker-based, more control)

1. Install the CLI: `curl -L https://fly.io/install.sh | sh`
2. `fly auth login`
3. From your backend folder: `fly launch` — this generates a `fly.toml` and (if missing) a `Dockerfile`. Answer the prompts (app name, region, no Postgres unless you need it).
4. Set secrets: `fly secrets set KEY=value` for each env var (never put secrets in `fly.toml` directly).
5. Deploy: `fly deploy`
6. Your app is live at `https://your-app-name.fly.dev`.

**Gotcha:** Fly.io requires a payment method on file even for free-tier usage (as fraud prevention) — you won't be charged within free limits, but be aware before recommending this to students without a card.

---

## 7. PythonAnywhere (Python backends only — Flask/Django)

1. Sign up at pythonanywhere.com (free "Beginner" account).
2. Go to **Files** → upload your backend code, or use the **Consoles → Bash** tab to `git clone` your repo.
3. Go to **Web** tab → **Add a new web app** → choose Flask or Django and your Python version.
4. Point the WSGI configuration file to your app's entry point (PythonAnywhere provides a template — edit the `path` and `import` lines to match your project).
5. Install dependencies via the Bash console: `pip3.x install --user -r requirements.txt`
6. Set environment variables in the **Web** tab's "Environment variables" section (Beginner accounts have limited support for this — hardcoding via a `.env` loaded with `python-dotenv` also works).
7. Click **Reload** on the Web tab. Your app is live at `https://yourusername.pythonanywhere.com`.

**Gotcha:** Free accounts can only make outbound requests to a small allowlist of external domains — check "Whitelisted Sites" if your backend calls third-party APIs.

---

## 8. Appwrite Sites (Full-Stack — frontend + backend + DB + auth, one platform)

1. Sign up at cloud.appwrite.io.
2. Create a new **Project**.
3. Go to **Sites** → **Create Site** → connect your GitHub repo, set root directory to your frontend folder.
4. Set build command and output directory (same as Vercel/Netlify conventions).
5. For your backend logic, use **Functions** instead of a separate hosted server: go to **Functions → Create Function**, choose your runtime (Node, Python, etc.), and connect it to the same repo pointing at your backend folder — Appwrite will run it as a serverless function triggered by HTTP.
6. Use **Databases** for your DB instead of a separate service if you want everything on one platform.
7. Add environment variables under each Function's/Site's **Settings**.
8. Deploy. Your site is live at `https://your-site.appwrite.network` (or your custom domain).

**Gotcha:** This works best if your backend can be expressed as discrete functions/endpoints rather than one long-running server process. If your backend is a traditional always-on Express/Flask server, pair Appwrite Sites (frontend) with Render/Koyeb/Fly.io (backend) instead.

---

## 9. Azure Static Web Apps (Frontend + light serverless backend)

1. Go to portal.azure.com → **Create a resource → Static Web App**.
2. Connect your GitHub repo. Set **App location** to your frontend folder, **API location** to your backend folder (if using Azure Functions for the backend), **Output location** to your build output folder (e.g. `dist`).
3. Azure auto-generates a GitHub Actions workflow file and commits it to your repo — this handles CI/CD automatically.
4. Add environment variables/app settings under **Configuration** in the Azure portal.
5. Your app deploys automatically on every push; check the **GitHub Actions** tab in your repo for build logs.

**Gotcha:** The free tier's integrated backend option is Azure Functions specifically — if your backend is a standard Express/Flask server rather than functions, host it separately (Render/Koyeb/Fly.io) and just use Azure Static Web Apps for the frontend.

---

## 10. Connecting Frontend to Backend (applies to every combo above)

1. **Get your backend's live URL** first (e.g. `https://your-backend.onrender.com`).
2. **Set it as an environment variable in your frontend**, not hardcoded:
   - Vite: `VITE_API_URL=https://your-backend.onrender.com`
   - Create React App: `REACT_APP_API_URL=https://your-backend.onrender.com`
   - Next.js: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
3. **Enable CORS on your backend** for your frontend's domain:

   Node/Express:
   ```js
   const cors = require('cors');
   app.use(cors({ origin: 'https://your-frontend.vercel.app' }));
   ```

   Python/FastAPI:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend.vercel.app"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

   Python/Flask:
   ```python
   from flask_cors import CORS
   CORS(app, origins=["https://your-frontend.vercel.app"])
   ```

4. Redeploy the backend after adding CORS, then redeploy/rebuild the frontend after setting the API URL env var.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Frontend loads but API calls fail with CORS error | Backend doesn't allow your frontend's origin | Add CORS config (Section 10) and redeploy backend |
| "Application failed to respond" / 502 | Backend not listening on the platform's assigned `$PORT` | Read port from `process.env.PORT` / `os.environ["PORT"]`, don't hardcode |
| First request takes 30–60s | Free-tier backend was asleep (Render/Koyeb) | Expected on free tiers — mention to users, or ping the backend periodically to keep it warm |
| Build fails, "module not found" | Missing dependency in `requirements.txt`/`package.json`, or wrong root directory set | Confirm root directory matches your actual backend/frontend folder |
| Env vars are `undefined` in frontend | Forgot the framework's required prefix (`VITE_`, `REACT_APP_`, `NEXT_PUBLIC_`) | Rename the variable with the correct prefix and rebuild |
| Secrets visible in GitHub | `.env` was committed | Remove from repo, rotate the exposed keys immediately, add `.env` to `.gitignore` |

---

## 12. Final Checklist Before Sharing Your Deployed App

- [ ] Frontend loads at its public URL
- [ ] Backend responds at its public URL (test a simple GET endpoint directly in the browser or with `curl`)
- [ ] Frontend successfully calls backend (check browser DevTools → Network tab for failed requests)
- [ ] No secrets committed to GitHub
- [ ] `.env.example` present in repo for anyone who clones it later
