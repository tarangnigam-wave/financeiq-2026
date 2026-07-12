---
title: FinanceIQ 2026
emoji: 📊
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
---

# FinanceIQ 2026 - Financial Institutions Dashboard

This is a comprehensive dashboard visualizing the financial data of the top 10 financial institutions in the world for the year 2026.

## Architecture

*   **Frontend:** React (Vite) + Tailwind CSS + Recharts
*   **Backend:** Python (FastAPI)
*   **Deployment:** Docker (Hugging Face Spaces)

## Local Development

### 1. Run the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 7860
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

This repository is configured to be deployed seamlessly on **Hugging Face Spaces**.
1. Create a new Space on Hugging Face.
2. Select **Docker** as the Space SDK.
3. Upload all the contents of this folder directly to the Space.
4. The space will automatically build the React frontend and serve it using the FastAPI backend.
