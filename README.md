# Tasklane

Team task manager: React + Vite + Tailwind on the front end, Node, Express, Passport and Postgres on the back end.

## Requirements checklist

| Requirement | Where |
| --- | --- |
| React + Tailwind + Vite | `client/` |
| REST API `/auth`, `/teams`, `/tasks` with Joi validation | `server/src/routes/`, `validate()` in `server/src/middleware.js` |
| Passport local + express-session in Postgres, HTTP-only cookie | `server/src/index.js`, `server/src/routes/auth.js` |
| Non-auth routes protected, bcrypt passwords | `requireAuth` in `index.js`, bcrypt cost 12 |
| Role-based access (owner / member) | `roleIn()` in `server/src/middleware.js`, enforced in SQL-scoped routes |
| Login-only due-date reminders | `GET /api/tasks/reminders`, `client/src/Reminders.jsx` |
| Email invites (stubbed) | `POST /api/invites` logs the invite; no email is sent |
| GCP database + deployment | Cloud SQL + Cloud Run, see [DEPLOY.md](DEPLOY.md) |
| Branch / PR history | one `feat/*` branch and merged PR per screen |

## Run it locally

You need Node 22+ and Docker (or any Postgres).

```bash
npm run setup                      # install root, server and client dependencies
cp server/.env.example server/.env # then set SESSION_SECRET to a long random string
docker compose up -d db            # Postgres on :5432
npm run dev                        # API on :8080, app on http://localhost:5173
npm run seed --prefix server -- you@example.com   # optional demo team + 20 tasks for an existing account
```

Tables are created on startup from `server/db/*.sql`. Sessions are stored in Postgres; `SESSION_STORE=memory` in `server/.env` uses the in-memory store for development only.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Cloud SQL socket URL in production) |
| `SESSION_SECRET` | signs the session cookie |
| `NODE_ENV` | `production` makes the cookie `secure` |
| `PORT` | default 8080 |
| `SESSION_STORE` | `memory` for dev only |

## API

All routes except `/api/auth/*` need a session. Non-members get 404, members without the right role get 403.

| Method and path | Who |
| --- | --- |
| `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me` | public (rate limited) |
| `GET/POST /api/teams`; `GET/PATCH/DELETE /api/teams/:id` | member / any user / owner |
| `GET/POST /api/teams/:id/members`; `DELETE /api/teams/:id/members/:userId` | member / owner |
| `GET /api/tasks?teamId&assigneeId&q`; `POST /api/tasks`; `PUT/DELETE /api/tasks/:id` | team member (delete: owner or creator) |
| `GET /api/tasks/reminders?today=YYYY-MM-DD` | once per login |
| `POST /api/invites` | team owner (stub) |

## Notes

- Invites are stubbed: the server logs them and returns a message; no email is sent.
- The due-date field uses the browser's native date picker.
