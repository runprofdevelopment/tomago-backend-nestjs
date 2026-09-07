#!/usr/bin/env node
/**
 * Generates Tomago Postman collection + environments.
 * Run: node scripts/generate-postman-collection.js
 */
const fs = require('fs');
const path = require('path');
const { STAGING, PROD, loadOps, resourceTag } = require('./lib/tomagoOps');

const OUT_DIR = path.join(__dirname, '../postman');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const LOGIN_TEST = [
  "if (pm.response.code === 200) {",
  "  const json = pm.response.json();",
  "  if (json.success && json.data) {",
  "    if (json.data.user && json.data.user.authenticationUid) {",
  "      pm.environment.set('authenticationUid', json.data.user.authenticationUid);",
  "    }",
  "    if (json.data.accessToken) pm.environment.set('accessToken', json.data.accessToken);",
  "    if (json.data.refreshToken) pm.environment.set('refreshToken', json.data.refreshToken);",
  "  }",
  "}",
].join('\n');

const TOKEN_TEST = [
  "if (pm.response.code === 200) {",
  "  const json = pm.response.json();",
  "  if (json.success && json.data && json.data.idToken) {",
  "    pm.environment.set('firebaseIdToken', json.data.idToken);",
  "  }",
  "}",
].join('\n');

function makeGqlRequest(op) {
  const body = { query: op.query };
  if (op.variables && Object.keys(op.variables).length) {
    body.variables = op.variables;
  }
  const prefix = op.public ? '[Public] ' : '';
  return {
    name: `${prefix}${op.name}`,
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Accept-Language', value: '{{lang}}' },
        { key: 'Authorization', value: 'Bearer {{firebaseIdToken}}', disabled: !!op.public },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify(body, null, 2),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/graphql',
      description: `${op.kind}: \`${op.name}\` → \`${op.returnType}\``,
    },
    response: [],
  };
}

function groupByResource(ops, audience) {
  const map = new Map();
  for (const op of ops) {
    const tag = resourceTag(audience, op.name);
    if (!map.has(tag)) map.set(tag, []);
    map.get(tag).push(op);
  }
  return [...map.entries()].map(([name, list]) => ({
    name,
    item: list.map(makeGqlRequest),
  }));
}

function buildAudienceFolder(label, audience, ops) {
  const mine = ops.filter((o) => o.audiences.includes(audience));
  const publicOps = mine.filter((o) => o.public);
  const authOps = mine.filter((o) => !o.public);
  const children = [];
  if (publicOps.length) {
    children.push({ name: 'Public', item: groupByResource(publicOps, audience) });
  }
  if (authOps.length) {
    children.push({ name: 'Authenticated', item: groupByResource(authOps, audience) });
  }
  return { name: label, item: children };
}

function buildCollection(ops) {
  return {
    info: {
      _postman_id: uuid(),
      name: 'Tomago API',
      description:
        'Tomago GraphQL + REST API.\n\n**Auth:** Run `00 Auth > Login` then `Get Firebase Token` before GraphQL.\n\nApidog: import OpenAPI modules from `docs/openapi/`.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [{ key: 'token', value: '{{firebaseIdToken}}', type: 'string' }],
    },
    variable: [
      { key: 'baseUrl', value: STAGING },
      { key: 'firebaseIdToken', value: '' },
      { key: 'email', value: 'admin@tomoga.demo' },
      { key: 'password', value: '' },
      { key: 'lang', value: 'en' },
    ],
    item: [
      {
        name: '00 Auth',
        item: [
          {
            name: 'Login',
            event: [{ listen: 'test', script: { type: 'text/javascript', exec: LOGIN_TEST.split('\n') } }],
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ email: '{{email}}', password: '{{password}}' }, null, 2),
                options: { raw: { language: 'json' } },
              },
              url: '{{baseUrl}}/api/auth/login',
              description: 'Email/password login. Saves authenticationUid + JWT.',
            },
          },
          {
            name: 'Get Firebase Token',
            event: [{ listen: 'test', script: { type: 'text/javascript', exec: TOKEN_TEST.split('\n') } }],
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/x-www-form-urlencoded' }],
              body: {
                mode: 'urlencoded',
                urlencoded: [{ key: 'uid', value: '{{authenticationUid}}' }],
              },
              url: '{{baseUrl}}/api/auth/token',
              description: 'Mints Firebase ID token for GraphQL.',
            },
          },
          {
            name: 'Refresh Token',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ refreshToken: '{{refreshToken}}' }, null, 2),
                options: { raw: { language: 'json' } },
              },
              url: '{{baseUrl}}/api/auth/refresh',
            },
          },
          {
            name: 'Logout',
            request: {
              auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              url: '{{baseUrl}}/api/auth/logout',
            },
          },
        ],
      },
      {
        name: '01 REST',
        item: [
          { name: 'Health Check', request: { method: 'GET', url: '{{baseUrl}}/health' } },
          {
            name: 'Upload File',
            request: {
              method: 'POST',
              header: [{ key: 'Authorization', value: 'Bearer {{firebaseIdToken}}' }],
              body: {
                mode: 'formdata',
                formdata: [{ key: 'files', type: 'file', src: [] }],
              },
              url: '{{baseUrl}}/upload-file',
            },
          },
        ],
      },
      buildAudienceFolder('02 Customer', 'Customer', ops),
      buildAudienceFolder('03 Admin', 'Admin', ops),
    ],
  };
}

function buildEnvironment(name, baseUrl, secrets = {}) {
  return {
    id: uuid(),
    name,
    values: [
      { key: 'baseUrl', value: baseUrl, type: 'default', enabled: true },
      { key: 'firebaseIdToken', value: '', type: 'secret', enabled: true },
      { key: 'email', value: secrets.email || 'admin@tomoga.demo', type: 'default', enabled: true },
      { key: 'password', value: secrets.password || '', type: 'secret', enabled: true },
      { key: 'lang', value: 'en', type: 'default', enabled: true },
      { key: 'authenticationUid', value: '', type: 'default', enabled: true },
      { key: 'accessToken', value: '', type: 'secret', enabled: true },
      { key: 'refreshToken', value: '', type: 'secret', enabled: true },
      { key: 'customerEmail', value: secrets.customerEmail || 'ahmed.ali@tomoga.demo', type: 'default', enabled: true },
      { key: 'customerPassword', value: secrets.customerPassword || '', type: 'secret', enabled: true },
    ],
    _postman_variable_scope: 'environment',
    _postman_exported_at: new Date().toISOString(),
    _postman_exported_using: 'generate-postman-collection.js',
  };
}

function main() {
  const ops = loadOps();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const collection = buildCollection(ops);
  const staging = buildEnvironment('Tomago Staging', STAGING, {
    email: 'admin@tomoga.demo',
    password: 'TomogaAdmin123!',
    customerEmail: 'ahmed.ali@tomoga.demo',
    customerPassword: 'TomogaDemo123!',
  });
  const prod = buildEnvironment('Tomago Production', PROD);

  fs.writeFileSync(path.join(OUT_DIR, 'Tomago-API.postman_collection.json'), JSON.stringify(collection, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'Tomago-Staging.postman_environment.json'), JSON.stringify(staging, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'Tomago-Production.postman_environment.json'), JSON.stringify(prod, null, 2));

  const customer = ops.filter((o) => o.audiences.includes('Customer')).length;
  const admin = ops.filter((o) => o.audiences.includes('Admin')).length;
  console.log('Wrote Postman files to', OUT_DIR);
  console.log(`Ops: total=${ops.length}, customer=${customer}, admin=${admin}`);

  fs.writeFileSync(
    path.join(OUT_DIR, 'README.md'),
    `# Tomago API — Postman

## Files

| File | Purpose |
|------|---------|
| \`Tomago-API.postman_collection.json\` | Auth + REST + Customer + Admin GraphQL |
| \`Tomago-Staging.postman_environment.json\` | Staging + seed credentials |
| \`Tomago-Production.postman_environment.json\` | Production (secrets empty) |

## Auth flow

1. Select **Tomago Staging**
2. Run **00 Auth → Login** then **Get Firebase Token**
3. Call GraphQL requests

## Seed credentials (after \`seed:firestore:auth\`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tomoga.demo | TomogaAdmin123! |
| Customer | ahmed.ali@tomoga.demo | TomogaDemo123! |

## Regenerate

\`\`\`bash
node scripts/generate-postman-collection.js
\`\`\`

For Apidog modules see \`docs/openapi/README.md\`.
`,
  );
}

main();
