# Tasklane

Team task manager built with React, Vite and Tailwind on the front end and Node, Express, Passport and Postgres on the back end.

## Run it locally

You need Node 22+ and Docker (or any Postgres).

```bash
npm run setup                      # install root, server and client dependencies
cp server/.env.example server/.env # then set SESSION_SECRET to a long random string
docker compose up -d db            # Postgres on :5432
npm run dev                        # API on :8080, app on http://localhost:5173
```

Tables are created on startup from `server/db/*.sql`. Sessions are stored in Postgres; set `SESSION_STORE=memory` in `server/.env` to use the in-memory store while developing.
