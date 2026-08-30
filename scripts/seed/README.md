# Firestore Seed

Relational demo data for Tomoga storefront, derived from `erd.dbml` and `api-contract.*`.

## Prerequisites

- Service account JSON in `service-accounts/{localhost|staging}.json`
- `NODE_ENV` set to `localhost`, `development`, `staging`, or `test`

## Commands

```bash
# Preview without writes
npm run seed:firestore:dry

# Seed staging (default)
npm run seed:firestore

# Clear seed_* docs then re-seed
npm run seed:firestore:clear

# Also create Firebase Auth users for demo login
npm run seed:firestore:auth
```

## Seed document IDs

All seeded documents use the `seed_` prefix for safe re-runs and `--clear-seed`.

## Relations seeded

| From | To | Field |
|------|-----|-------|
| category | collection | `collection_id` |
| product | brand, category, collection | `brand_id`, `category_id`, `collection_id` |
| product-variants | product | `product_id` |
| inventory | product | `productId` |
| project | products | `featured_product_ids[]` |
| showRoom | project | `project_id` |
| user/addresses | user | subcollection |
| order | user, products | `userID`, `items[].productId` |
| paymentMethod, customerSettings | user | `customer_id` |

## Demo users (with `--with-auth`)

| Role | Email | Password |
|------|-------|----------|
| Customer | ahmed.ali@tomoga.demo | TomogaDemo123! |
| Admin | admin@tomoga.demo | TomogaAdmin123! |

## Production

Blocked unless both flags are passed:

```bash
NODE_ENV=production node scripts/seed/index.js --allow-production --confirm-production=I-UNDERSTAND
```

## Verify relations (no Firestore)

```bash
npm run seed:verify
```

Runs 41 in-memory FK checks across all seed datasets.

## Local emulator (optional)

Requires Java (Firestore emulator dependency):

```bash
firebase emulators:start --only firestore,auth --project tomago-seed-emulator
npm run seed:firestore:emulator
```

## Troubleshooting

**`5 NOT_FOUND` on write:** The Firestore database id is `default` (not the implicit `(default)`). The seed script uses `getFirestore(app, 'default')` from config `databaseId`. If you still see NOT_FOUND, enable Firestore in Firebase Console.

```bash
npm run seed:firestore:auth
```

**Re-seed from scratch:**

```bash
npm run seed:firestore:clear && npm run seed:firestore:auth
```
