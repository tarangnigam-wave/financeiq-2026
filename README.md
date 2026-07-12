# FinanceIQ 2026 - Financial Institutions Dashboard

This is a comprehensive dashboard visualizing the financial data of the top 10 financial institutions projected for 2026. The project is split into a **Python FastAPI backend** and a **React + Vite frontend**.

## 🚀 Full-Stack Deployment Playbook

This repository is ready to be deployed across multiple modern cloud platforms. 

### 1. Fully Automated Deployment (Render API)
We have fully automated the deployment using Render's REST API.
1. Generate a Render API Key.
2. Ensure your GitHub Personal Access Token (PAT) has `Administration` and `Contents` Read/Write permissions so you can push code.
3. A Python script can automatically create the Backend Web Service and Frontend Static Site, and instantly inject the backend's URL into the frontend's `VITE_API_URL` environment variable.

### 2. Manual Deployment (Render Free Tier)
If deploying manually on Render:
*   **Backend:** Create a Web Service pointing to the `backend` directory. Build command: `pip install -r requirements.txt`. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
*   **Frontend:** Create a Static Site pointing to the `frontend` directory. Build command: `npm install && npm run build`. Publish directory: `dist`. Add `VITE_API_URL` pointing to your backend URL.

### 3. Alternative Platform: Vercel (Frontend) + Render (Backend)
Vercel is a lightning-fast alternative for hosting the React frontend:
1. **Backend:** Deploy the backend to Render as described above.
2. **Frontend:** Go to Vercel and import this GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. In the Environment Variables section, add `VITE_API_URL` and paste your Render backend URL.
5. Click **Deploy**. Vercel will automatically detect Vite and build the site.

---
*Note: This repository contains everything needed to run locally or deploy globally in minutes!*
