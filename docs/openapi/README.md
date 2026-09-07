# Tomago OpenAPI — Apidog modules

Like Medusa (**Store API** | **Admin API**):

| Tab | File |
|-----|------|
| **Customer API** | `tomago-customer-api.openapi.json` |
| **Admin API** | `tomago-admin-api.openapi.json` |

## Import into Apidog

1. Create project (General Mode)
2. **Import** → **OpenAPI/Swagger**
3. Import each file with **Create a new module**
4. Publish Docs → top modules: Customer API | Admin API

## Regenerate

```bash
node scripts/generate-postman-collection.js
node scripts/generate-openapi.js
node scripts/generate-openapi.js "$HOME/Downloads/tomago-openapi"
```

## Servers

- Staging: `https://tomago-staging-7125900076.europe-west3.run.app`
- Production: `https://tomago-649000455905.europe-west3.run.app`

## Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tomoga.demo | TomogaAdmin123! |
| Customer | ahmed.ali@tomoga.demo | TomogaDemo123! |
