# Stage 1: Build the frontend (Node)
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend and serve the app (Python)
FROM python:3.11-slim
WORKDIR /app

# Create a non-root user for Hugging Face Spaces compatibility
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app
COPY --chown=user backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY --chown=user backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder --chown=user /app/frontend/dist ./frontend/dist

# Expose port for Hugging Face Spaces
EXPOSE 7860

# Run FastAPI using uvicorn on port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
