# Railway Deployment Skill

This repo deploys to Railway as two independent services.

## Service Configuration

**Backend:**
- Root directory: `/backend`
- Exposes port 8080 (Railway injects `PORT` automatically)
- Uses `uvicorn app.main:app`

**Frontend:**
- Root directory: `/frontend`
- Uses Vite build output served with `serve -s dist -l $PORT`
- Exposes port 3000

## Always Do These

- Add `.env.example` files
- Keep secrets out of Git
- Add Dockerfiles for reproducible builds
- Commit `package-lock.json` for the frontend — `npm ci` requires it
- Add `railway.json` to each service directory to force Dockerfile builder (Railway defaults to Railpack which may fail)
- Add CORS middleware to the FastAPI backend so the frontend can reach it across domains
- Declare `VITE_API_BASE_URL` as a Docker build arg in the frontend Dockerfile — Vite bakes env vars at build time, not runtime

## railway.json (required in both /backend and /frontend)

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

## Frontend Dockerfile build arg pattern

```dockerfile
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build
```

## Backend CORS middleware (required)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Railway Dashboard Steps

1. Create one service per service directory, setting **Root Directory** to `/backend` or `/frontend`
2. Generate a public domain per service — Railway will ask for the internal port
3. Set `VITE_API_BASE_URL` in the frontend service **Variables** tab (no port, no trailing slash)
4. `VITE_API_BASE_URL` must be set **before** the frontend builds — it is baked into the bundle at build time
