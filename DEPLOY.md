# Deploying to Google Cloud

Architecture: **one container** on Cloud Run serves the API and the built React app. Postgres is Cloud SQL, reached over a Unix socket. Secrets live in Secret Manager.

## Steps

1. Create a Google Cloud project and link a billing account (new accounts get free trial credits, which cover Cloud SQL).
2. Open [Cloud Shell](https://shell.cloud.google.com) and clone your repo.
3. Run:

   ```bash
   PROJECT=your-project-id bash deploy/gcp.sh
   ```

   The first run takes around 10 minutes (Cloud SQL is the slow part). It prints the service URL at the end.
4. Open the URL, register an account, and you're live. Put that URL in your Indeed message.

## What the script sets

| Variable | Value | Source |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://…@/tasklane?host=/cloudsql/PROJECT:REGION:tasklane-db` | Secret Manager |
| `SESSION_SECRET` | random 64 hex characters | Secret Manager |
| `NODE_ENV` | `production` | env var |

## Redeploying after changes

```bash
PROJECT=your-project-id bash deploy/gcp.sh
```

It skips database creation when it already exists and just rebuilds and redeploys.

## Cost and cleanup

Cloud Run has a free tier. The smallest Cloud SQL instance costs roughly $10 a month, so delete it once the review is finished:

```bash
gcloud sql instances delete tasklane-db
gcloud run services delete tasklane --region us-central1
```

## Troubleshooting

- **`--allow-unauthenticated` is refused:** your organization blocks public services. Use a personal Google account and project.
- **Script stopped halfway on the first run:** delete the partial setup (`gcloud sql instances delete tasklane-db`, `gcloud secrets delete database-url`, `gcloud secrets delete session-secret`) and run it again.
- **Login works but you get signed out immediately:** `NODE_ENV=production` is set but the request isn't HTTPS. Use the `https://` Cloud Run URL.
- **Logs:** `gcloud run services logs read tasklane --region us-central1`
