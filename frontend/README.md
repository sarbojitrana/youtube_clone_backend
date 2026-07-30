# StreamHub Frontend

Minimal Vite + React client for the StreamHub backend: register, log in, view your profile, log out.

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:8000/api/v1
npm run dev
```

The backend must be running (see `../backend`) for auth requests to succeed.
