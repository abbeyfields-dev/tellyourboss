# Boss-Rater API

Private scorecards for many people. Prisma + Postgres, same Cloud Run / Cloud SQL shape as Navayro.

## Data model

- **User** — the rater (email / password JWT)
- **Subject** — a person they rate (`BOSS`, `PEER`, `REPORT`, …). Private to that user.
- **Scorecard** — one campaign. Drafts resume; completed rows are history.
- **ScorecardAnswer** — `parameterId` + 1–5
- **ScorecardDimensionScore** — cached world averages

Question copy stays in the app. The API only validates parameter IDs.

## Local

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

## GCP (`founders@navayro.com`, project `bossorater`)

```bash
gcloud auth login --account=founders@navayro.com
npm run gcp:provision
npm run deploy:dev
```

Cloud SQL mirrors Navayro: Postgres 15, `db-f1-micro`, `us-central1`, zonal SSD, daily backups.
