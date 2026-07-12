from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from data import companies

app = FastAPI(title="Finance Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/companies")
def get_companies():
    return {"companies": companies}

@app.get("/api/companies/{ticker}")
def get_company(ticker: str):
    for comp in companies:
        if comp["ticker"].upper() == ticker.upper():
            return comp
    raise HTTPException(status_code=404, detail="Company not found")

# Serve the static frontend built by Vite
static_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

# We mount the static directory at the root only if it exists (for HF deployment)
if os.path.isdir(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve index.html for any path not found (to support client-side routing)
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
