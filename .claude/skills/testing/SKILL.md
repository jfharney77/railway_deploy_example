# Railway Deployment Skill

This repo deploys to Railway as two services.

Backend:
- Root directory: /backend
- Exposes port 8000
- Uses uvicorn app.main:app

Frontend:
- Root directory: /frontend
- Uses Vite build output
- Uses serve -s dist -l $PORT

Always:
- Add .env.example files
- Keep secrets out of Git
- Add Dockerfiles if build behavior is complex