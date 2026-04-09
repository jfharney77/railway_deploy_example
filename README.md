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
docker run -p 8000:8000 my-backend
```

### Frontend

```bash
docker build -t my-frontend ./frontend
docker run -p 3000:3000 -e PORT=3000 my-frontend
```

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
