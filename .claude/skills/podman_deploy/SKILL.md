# Podman Deployment Skill

This skill covers building and running the FastAPI + React monorepo locally using Podman instead of Docker.

Podman is daemonless and rootless by default. Commands are largely Docker-compatible (`podman` can be aliased to `docker`), but there are important differences noted below.

## Building Images

### Backend

```bash
podman build -t my-backend ./backend
```

### Frontend

```bash
podman build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -t my-frontend ./frontend
```

> `VITE_API_BASE_URL` must be passed as a build arg — Vite bakes it into the bundle at build time.

## Running Containers

### Backend

```bash
podman run -d \
  --name backend \
  -p 8080:8080 \
  -e PORT=8080 \
  my-backend
```

### Frontend

```bash
podman run -d \
  --name frontend \
  -p 3000:3000 \
  -e PORT=3000 \
  my-frontend
```

## Running Both Together with Podman Compose

Create a `compose.yaml` at the repo root:

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - PORT=8080

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_BASE_URL: http://localhost:8080
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
    depends_on:
      - backend
```

Run with:

```bash
podman compose up --build
```

## Key Differences from Docker

| Topic | Docker | Podman |
|-------|--------|--------|
| Daemon | Requires `dockerd` | Daemonless |
| Root | Runs as root by default | Rootless by default |
| Compose | `docker compose` | `podman compose` (requires `podman-compose` pkg) |
| Networking | Bridge network by default | Rootless uses `slirp4netns` — `localhost` on host ≠ container |
| Image storage | `/var/lib/docker` | `~/.local/share/containers` |

## Rootless Networking Gotcha

In rootless Podman, containers cannot reach `localhost` on the host directly. When running frontend + backend as separate containers **without** compose, use `host.containers.internal` instead of `localhost`:

```bash
podman run -d \
  --name frontend \
  -p 3000:3000 \
  -e PORT=3000 \
  --build-arg VITE_API_BASE_URL=http://host.containers.internal:8080 \
  my-frontend
```

With `podman compose`, containers share a network and can reach each other by service name (e.g., `http://backend:8080`).

## Always Do These

- Pass `VITE_API_BASE_URL` as `--build-arg` when building the frontend image
- Ensure the FastAPI backend has CORS middleware enabled (see `backend/app/main.py`)
- Use `podman compose` for local multi-service development to avoid rootless networking issues
- Install `podman-compose` if `podman compose` is not available: `pip install podman-compose`
