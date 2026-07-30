# StreamHub Backend

Express + MongoDB API for user auth and profile management (a YouTube-clone style backend). Only the user routes are currently wired up in `src/app.js`; several model/controller files for videos, comments, likes, playlists, etc. exist but aren't mounted yet.

## Setup

```bash
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secrets, Cloudinary credentials
npm run dev
```

Server runs on `PORT` (default `8000`).

## API

Base path: `/api/v1/users`

| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/register` | - | multipart: `fullName`, `email`, `username`, `password`, `avatar` (file, required), `coverImage` (file, optional) |
| POST | `/login` | - | JSON: `username` or `email`, `password` |
| POST | `/logout` | yes | |
| POST | `/refresh-token` | - | |
| POST | `/change-password` | yes | |
| GET | `/current-user` | yes | |
| PATCH | `/update-account` | yes | |
| PATCH | `/avatar` | yes | multipart: `avatar` |
| PATCH | `/cover-image` | yes | multipart: `coverImage` |
| GET | `/c/:username` | yes | channel profile |
| GET | `/history` | yes | watch history |

Auth accepts either the `accessToken` cookie or an `Authorization: Bearer <token>` header. The login/register response also returns `accessToken`/`refreshToken` in the JSON body, so a browser client can use the header instead of relying on cookies (the cookies are set with `secure: true`, which browsers drop over plain HTTP).
