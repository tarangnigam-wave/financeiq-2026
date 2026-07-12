# Deployment Playbook: Frontend on AI App Builders + Backend on Free Hosting

## How to use this file
Paste this file into your AI assistant along with:

> "My frontend is built on [Lovable / Emergent / Base44 / Replit] and my backend code is in `/backend`. Follow the playbook below to deploy my backend to [PLATFORM] and connect it to my frontend."

This guide is for the common student setup: you built your UI visually/with an AI builder (no separate frontend codebase to deploy the traditional way), and you have a real backend (Node/Python/etc.) that needs to run somewhere and be called by that UI over HTTPS.

**The core pattern is always the same, regardless of which builder you used:**
1. Deploy your backend to a real hosting platform (Render, Koyeb, Fly.io, Railway, PythonAnywhere).
2. Get its public URL, e.g. `https://your-backend.onrender.com`.
3. Enable CORS on the backend for your builder's preview/published domain.
4. Paste that backend URL into your builder's environment variables / API settings.
5. Call it from your builder's frontend like any external API.

---

## 🤖 Part 0: Fully Automated Backend Deployment (The AI Way)

If you don't want to manually click through dashboards, you can ask your AI to automate the deployment using the **Render API** and **GitHub MCP**.

1. **Install GitHub MCP:** Ask your AI assistant to "install the GitHub MCP".
2. **Provide API Tokens:** Give the AI a **GitHub PAT** (with `Administration` & `Contents` Read/Write permissions) and your **Render API Key**.
3. **Prompt the AI:** *"Use my GitHub PAT to create a repo and push my backend code. Then use my Render API key to automatically deploy it as a Web Service. Give me the live URL when done."*

---

## Part 1: Deploy Your Backend First (Manual Methods)

Pick the platform that fits your backend and follow it — this is identical to the backend sections in the code-ready playbook.

### Render
1. render.com → sign in with GitHub → **New → Web Service** → connect repo, set Root Directory to your backend folder.
2. Build Command: `npm install` or `pip install -r requirements.txt`.
3. Start Command: `node index.js` / `uvicorn main:app --host 0.0.0.0 --port $PORT` / etc.
4. Instance type: Free. Add env vars under **Environment**.
5. Deploy → copy the generated URL (`https://your-backend.onrender.com`).

### Koyeb
1. koyeb.com → **Create Web Service → GitHub** → point to your backend folder.
2. Choose Free instance, set Run Command and Port to match your app.
3. Deploy → copy the generated URL (`https://your-app.koyeb.app`).

### Fly.io
1. `curl -L https://fly.io/install.sh | sh` → `fly auth login`
2. From backend folder: `fly launch` (generates `fly.toml`/`Dockerfile`)
3. `fly secrets set KEY=value` for each secret
4. `fly deploy` → copy the URL (`https://your-app.fly.dev`)

### Railway
1. railway.app → **New Project → Deploy from GitHub repo** → select backend folder as root.
2. Set Start Command in Settings if not auto-detected, add env vars under Variables.
3. **Settings → Networking → Generate Domain** → copy the URL.

### PythonAnywhere (Python only)
1. Upload/clone your backend code, set up a Flask/Django web app under the **Web** tab.
2. Install requirements, edit the WSGI file to point at your app.
3. Reload → your backend is live at `https://yourusername.pythonanywhere.com`.

**Once deployed, test your backend directly** — open `https://your-backend-url.com/your-health-check-route` in a browser or run:
```bash
curl https://your-backend-url.com/api/health
```
Confirm it responds before moving to Part 2. Don't debug the frontend connection until you know the backend works standalone.

---

## Part 1.5: Exporting Builder Code to Vercel (Optional)

If you choose to export your builder's code (e.g., exporting a React/Vite project from Lovable) instead of hosting it on their platform, **Vercel** is the best place to host the frontend.

1. Export the code from your builder and push it to a new GitHub repository.
2. Go to **vercel.com** → **Add New Project** → Import your frontend repo.
3. In the Vercel deployment settings, add an Environment Variable (e.g., `VITE_API_URL`) and paste your live backend URL (from Part 1).
4. Click **Deploy**. Vercel will instantly build and host your exported frontend for free!

---

## Part 2: Connect Each Builder to Your Backend

### Lovable
1. In your Lovable project, open the **project settings / environment variables** panel (Lovable stores env vars per project).
2. Add a variable, e.g. `API_URL = https://your-backend.onrender.com`.
3. In your prompts to Lovable, explicitly tell it to use that variable for API calls rather than hardcoding a URL — e.g. "Use the `API_URL` environment variable as the base URL for all backend requests, not a hardcoded string."
4. Add your Lovable app's published domain (shown in Lovable's publish/share settings) to your backend's CORS allowlist (see Part 3).
5. Republish in Lovable, then test a live action that hits your backend (form submit, data fetch, etc.).

### Emergent
1. Open your Emergent project's configuration/integrations section and add your backend URL as an environment variable or "connected API."
2. When prompting Emergent to build features, specify the exact backend endpoint paths and methods you expect it to call (e.g. "POST to `{API_URL}/api/signup` with `email` and `password`") — this avoids Emergent inventing its own backend logic instead of calling yours.
3. Grab Emergent's live/preview domain and add it to your backend's CORS allowlist.
4. Redeploy/republish in Emergent and test.

### Base44
1. In Base44, go to your app's settings and look for **Integrations** or **Custom API** configuration — add your backend's base URL there.
2. For any data-fetching component or action Base44 generates, point it explicitly at your backend endpoints rather than Base44's built-in database/backend features, since Base44 also offers its own hosted backend that can conflict with your separately hosted one.
3. Copy Base44's published app URL and add it to your backend's CORS allowlist.
4. Test the connection after publishing.

### Replit
1. If your frontend lives in a Replit app, open the **Secrets** tab (lock icon) and add `API_URL = https://your-backend.onrender.com` as a secret — Replit injects secrets as environment variables at runtime.
2. In your frontend code, reference `process.env.API_URL` (Node) or the equivalent for your framework instead of a hardcoded URL.
3. Copy your Replit app's live URL (shown when you click **Run**, format like `https://your-repl-name.username.repl.co`) and add it to your backend's CORS allowlist.
4. Click **Run**/redeploy and test.

---

## Part 3: CORS — Required for Every Builder Above

Your backend must explicitly allow requests from whichever domain your builder publishes your frontend to. Add all relevant domains (preview + published) to the allowlist.

**Node/Express:**
```js
const cors = require('cors');
app.use(cors({
  origin: [
    'https://your-app.lovable.app',
    'https://your-app.emergent.sh',
    'https://your-app.base44.app',
    'https://your-repl-name.username.repl.co'
  ]
}));
```

**Python/FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.lovable.app",
        "https://your-app.emergent.sh",
        "https://your-app.base44.app",
        "https://your-repl-name.username.repl.co",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Python/Flask:**
```python
from flask_cors import CORS
CORS(app, origins=[
    "https://your-app.lovable.app",
    "https://your-app.emergent.sh",
    "https://your-app.base44.app",
    "https://your-repl-name.username.repl.co",
])
```

Redeploy your backend after editing CORS settings — the change won't take effect until it restarts.

---

## Part 4: Common Pitfalls With Builder Frontends Specifically

| Symptom | Likely cause | Fix |
|---|---|---|
| Requests blocked, CORS error in browser console | Builder's domain not in backend's CORS allowlist | Add the exact domain (check for `www.`/preview subdomains) and redeploy backend |
| Builder generated its own backend/database instead of calling yours | Prompt to the builder wasn't explicit about using an external API | Re-prompt naming the exact `API_URL` variable and endpoint paths; explicitly say "do not create your own backend/database for this feature" |
| Env var / secret shows as blank in the builder | Builder requires a redeploy/republish after adding secrets | Republish the project after saving the variable |
| Works in builder's preview but breaks after publishing | Preview and published domains differ | Add **both** domains to your backend's CORS allowlist |
| Backend works via `curl` but not from the builder | Wrong HTTP method or missing headers (e.g. `Content-Type: application/json`) expected by your backend | Check your backend's route requirements and confirm the builder's request config matches |
| Slow first response after publishing | Backend host (Render/Koyeb) was asleep on free tier | Expected — first request wakes it up, subsequent ones are fast |

---

## Part 5: Final Checklist

- [ ] Backend deployed and responds to a direct `curl`/browser test
- [ ] Backend's CORS allowlist includes both preview and published frontend domains
- [ ] Builder's environment variable/secret for the backend URL is set and referenced (not hardcoded)
- [ ] A real end-to-end action tested from the published frontend (not just the builder's internal preview)
- [ ] No API keys or secrets pasted directly into builder prompts or visible in frontend code — keep them on the backend only
