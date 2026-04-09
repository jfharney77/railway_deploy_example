# Hello World — FastAPI + React Monorepo

A minimal full-stack hello-world app deployed to Railway as two independent services.

| Service  | Stack                     | Railway root dir |
|----------|---------------------------|-----------------|
| Backend  | FastAPI + uvicorn         | `/backend`      |
| Frontend | React + Vite + TypeScript | `/frontend`     |

---

## Local Development

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Endpoints:
- `GET http://localhost:8000/health` → `{"status":"ok"}`
- `GET http://localhost:8000/hello`  → `{"message":"Hello from FastAPI"}`

### Run backend tests

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # starts at http://localhost:5173
```

The Vite dev server proxies `/hello` and `/health` to `http://localhost:8000`, so no extra config is needed locally.

---

## Docker

### Backend

```bash
docker build -t my-backend ./backend
docker run -p 8080:8080 -e PORT=8080 my-backend
```

### Frontend

```bash
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t my-frontend ./frontend
docker run -p 3000:3000 -e PORT=3000 my-frontend
```

---

## Podman

Podman is daemonless and rootless — commands mirror Docker exactly.

### Both services via Podman Compose (recommended)

```bash
podman compose up --build
```

Frontend will be available at `http://localhost:3000`, backend at `http://localhost:8080`.

### Individual containers

```bash
# Backend
podman build -t my-backend ./backend
podman run -d --name backend -p 8080:8080 -e PORT=8080 my-backend

# Frontend (VITE_API_BASE_URL must be set at build time)
podman build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t my-frontend ./frontend
podman run -d --name frontend -p 3000:3000 -e PORT=3000 my-frontend
```

> **Rootless networking note:** If running containers individually (not via compose), use `http://host.containers.internal:8080` instead of `http://localhost:8080` for `VITE_API_BASE_URL`.

---

## Railway Deployment

### Deploy the Backend

1. Create a new Railway service.
2. Connect your GitHub repo.
3. Set **Root Directory** to `/backend`.
4. Railway auto-detects the `Dockerfile` and builds it.
5. No additional environment variables are required — Railway injects `PORT` automatically.

### Deploy the Frontend

1. Create a second Railway service in the same project.
2. Connect the same GitHub repo.
3. Set **Root Directory** to `/frontend`.
4. Railway auto-detects the `Dockerfile` and builds it.
5. Add the environment variable:

   | Variable           | Value                                      |
   |--------------------|--------------------------------------------|
   | `VITE_API_BASE_URL`| The public URL of your backend service, e.g. `https://your-backend.up.railway.app` |

   > **Note:** `VITE_API_BASE_URL` is baked into the frontend bundle at build time, so it must be set before the Docker image is built. Set it as a Railway build variable.

### Step-by-Step Deployment Walkthrough

This documents the actual steps taken to get both services live, including gotchas encountered along the way.

#### 1. Add `railway.json` to each service directory

Railway defaults to Railpack, which may fail to detect the build plan. Force it to use Docker by adding a `railway.json` in both `backend/` and `frontend/`:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

#### 2. Set Root Directory per service in Railway

When creating each Railway service, set the **Root Directory** under Source settings:
- Backend service → `/backend`
- Frontend service → `/frontend`

Without this, Railway scans the repo root and fails to find the Dockerfile.

#### 3. Commit `package-lock.json` for the frontend

The frontend Dockerfile uses `npm ci`, which requires a lockfile. Generate and commit it:

```bash
cd frontend
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
```

#### 4. Generate public domains and set the correct port

In each service → **Settings** → **Networking** → **Generate Domain**. Railway will ask for the internal port your container listens on:
- Backend: `8080` (or whatever `PORT` is set to)
- Frontend: `3000`

The public URL has no port — Railway handles routing on its end.

#### 5. Set `VITE_API_BASE_URL` on the frontend service

In the frontend service → **Variables** tab, add:

```
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

No trailing slash, no port number.

#### 6. Add CORS middleware to the backend

Without CORS, the browser blocks cross-origin requests from the frontend domain. Add to `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 7. Declare `VITE_API_BASE_URL` as a build arg in the frontend Dockerfile

Vite bakes environment variables into the bundle at **build time**, not runtime. The Dockerfile must declare the variable explicitly:

```dockerfile
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build
```

Without this, `VITE_API_BASE_URL` is empty in the bundle and the frontend calls `/hello` on itself.

---

### Environment Variables Summary

**Backend** (Railway injects automatically)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `8000`  | Port uvicorn listens on |

**Frontend** (must be set before build)

| Variable            | Example                                      | Description |
|---------------------|----------------------------------------------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.up.railway.app`        | Backend public URL |
| `PORT`              | set by Railway                               | Port `serve` listens on |
