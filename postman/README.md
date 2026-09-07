# Tomago API — Postman

## Files

| File | Purpose |
|------|---------|
| `Tomago-API.postman_collection.json` | Auth + REST + Customer + Admin GraphQL |
| `Tomago-Staging.postman_environment.json` | Staging + seed credentials |
| `Tomago-Production.postman_environment.json` | Production (secrets empty) |

## Auth flow

1. Select **Tomago Staging**
2. Run **00 Auth → Login** then **Get Firebase Token**
3. Call GraphQL requests

## Seed credentials (after `seed:firestore:auth`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tomoga.demo | TomogaAdmin123! |
| Customer | ahmed.ali@tomoga.demo | TomogaDemo123! |

## Regenerate

```bash
node scripts/generate-postman-collection.js
```

For Apidog modules see `docs/openapi/README.md`.
