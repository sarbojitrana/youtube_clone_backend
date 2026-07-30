# StreamHub

A YouTube-clone style project: Express/MongoDB backend with a minimal React frontend for registering, logging in, and viewing your profile.

```
streamhub/
├── backend/    Express + MongoDB API (see backend/readme.md)
└── frontend/   Vite + React client (see frontend/README.md)
```

## Quick start

```bash
# backend
cd backend
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secrets, Cloudinary credentials
npm run dev             # http://localhost:8000

# frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

The frontend only covers register/login/logout/current-user against the backend's user API — it's intentionally minimal, not a full video-browsing UI.
