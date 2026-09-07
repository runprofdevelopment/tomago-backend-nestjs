#!/usr/bin/env node
/**
 * Generates Tomago OpenAPI modules for Apidog (Medusa-style tabs):
 *   Customer API | Admin API
 *
 * Run: node scripts/generate-openapi.js [extra-output-dir]
 */
const fs = require('fs');
const path = require('path');
const { STAGING, PROD, loadOps, resourceTag } = require('./lib/tomagoOps');

const schemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'auth/invalid-credentials' },
          message: { type: 'string', example: 'Invalid credentials' },
        },
      },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@tomoga.demo' },
      password: { type: 'string', format: 'password', example: 'TomogaAdmin123!' },
    },
  },
  LoginResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              accountType: { type: 'string' },
              authenticationUid: { type: 'string' },
            },
          },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'integer', example: 3600 },
        },
      },
    },
  },
  TokenResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          idToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'string', example: '3600' },
        },
      },
    },
  },
  RefreshRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: { refreshToken: { type: 'string' } },
  },
  GraphQLRequest: {
    type: 'object',
    required: ['query'],
    properties: {
      query: { type: 'string' },
      variables: { type: 'object', additionalProperties: true },
    },
  },
  GraphQLResponse: {
    type: 'object',
    properties: {
      data: { type: 'object', additionalProperties: true },
      errors: { type: 'array', items: { type: 'object' } },
    },
  },
  HealthResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'healthy' },
      timestamp: { type: 'string', format: 'date-time' },
      environment: { type: 'string' },
    },
  },
  UploadResponse: {
    type: 'object',
    properties: { urls: { type: 'array', items: { type: 'string', format: 'uri' } } },
  },
};

function responses(schemaRef, example, description = 'Successful response') {
  return {
    '200': {
      description,
      content: {
        'application/json': {
          schema: schemaRef ? { $ref: schemaRef } : { type: 'object' },
          examples: example ? { success: { summary: 'Success', value: example } } : undefined,
        },
      },
    },
    '400': {
      description: 'Bad request',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
    '401': {
      description: 'Unauthorized',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
  };
}

function apidogTestCases(cases) {
  return cases.map((c) => ({
    name: c.name,
    request: c.request || {},
    response: c.response || {},
    'x-apidog-expected-status': c.status || 200,
  }));
}

function buildAuthPaths() {
  return {
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login',
        operationId: 'authLogin',
        description: 'Email/password login. Returns JWT + `authenticationUid`.\n\n**Next:** Get Firebase Token, then GraphQL.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                admin: {
                  summary: 'Staging admin (seed)',
                  value: { email: 'admin@tomoga.demo', password: 'TomogaAdmin123!' },
                },
                customer: {
                  summary: 'Staging customer (seed)',
                  value: { email: 'ahmed.ali@tomoga.demo', password: 'TomogaDemo123!' },
                },
              },
            },
          },
        },
        responses: responses('#/components/schemas/LoginResponse', {
          success: true,
          data: {
            user: {
              id: 'seed_admin',
              email: 'admin@tomoga.demo',
              accountType: 'admin',
              authenticationUid: 'seed_admin',
            },
            accessToken: 'eyJ...',
            refreshToken: 'eyJ...',
            expiresIn: 3600,
          },
        }),
        'x-apidog-folder': 'Authentication',
        'x-apidog-testcases': apidogTestCases([
          { name: 'TC01 — Admin login', status: 200, request: { body: { email: 'admin@tomoga.demo', password: 'TomogaAdmin123!' } } },
          { name: 'TC02 — Invalid credentials', status: 401, request: { body: { email: 'x@y.com', password: 'wrong' } } },
        ]),
      },
    },
    '/api/auth/token': {
      post: {
        tags: ['Authentication'],
        summary: 'Get Firebase Token',
        operationId: 'authGetFirebaseToken',
        description: 'Mint Firebase ID token from `authenticationUid`. Required for GraphQL.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                required: ['uid'],
                properties: { uid: { type: 'string', example: 'seed_admin' } },
              },
            },
          },
        },
        responses: responses('#/components/schemas/TokenResponse', {
          success: true,
          data: { idToken: 'eyJ...', refreshToken: 'AMf...', expiresIn: '3600' },
        }),
        'x-apidog-folder': 'Authentication',
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh Token',
        operationId: 'authRefresh',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: responses('#/components/schemas/LoginResponse'),
        'x-apidog-folder': 'Authentication',
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout',
        operationId: 'authLogout',
        security: [{ bearerAuth: [] }],
        responses: responses(null, { success: true }),
        'x-apidog-folder': 'Authentication',
      },
    },
  };
}

function buildUtilityPaths() {
  return {
    '/health': {
      get: {
        tags: ['Utilities'],
        summary: 'Health Check',
        operationId: 'healthCheck',
        security: [],
        responses: responses('#/components/schemas/HealthResponse', {
          status: 'healthy',
          timestamp: '2026-09-07T00:00:00.000Z',
          environment: 'staging',
        }),
        'x-apidog-folder': 'Utilities',
      },
    },
    '/upload-file': {
      post: {
        tags: ['Utilities'],
        summary: 'Upload File',
        operationId: 'uploadFile',
        description: 'Multipart field `files` (max 30). Auth: Firebase ID token.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['files'],
                properties: { files: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: responses('#/components/schemas/UploadResponse', {
          urls: ['https://storage.googleapis.com/example.jpg'],
        }),
        'x-apidog-folder': 'Utilities',
      },
    },
  };
}

function buildGqlPaths(ops, audience) {
  const paths = {};
  const mine = ops.filter((o) => o.audiences.includes(audience));
  for (const op of mine) {
    const tag = resourceTag(audience, op.name);
    const pathKey = `/graphql/${op.name}`;
    // Prefer authenticated version if same name appears twice
    if (paths[pathKey] && op.public) continue;
    paths[pathKey] = {
      post: {
        tags: [tag],
        summary: op.name,
        operationId: `${audience.toLowerCase()}_${op.name}`,
        description: `${op.public ? '**Public**.\n\n' : `Requires Firebase ID token (${audience}).\n\n`}${op.kind} \`${op.name}\`: \`${op.returnType}\`\n\n**Send to:** \`POST /graphql\``,
        security: op.public ? [] : [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'Accept-Language',
            in: 'header',
            schema: { type: 'string', enum: ['en', 'ar'], default: 'en' },
            example: 'en',
          },
        ],
        requestBody: {
          required: true,
          description: 'GraphQL body. **Actual path:** `POST /graphql`',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GraphQLRequest' },
              examples: {
                default: {
                  summary: 'Example',
                  value: { query: op.query, variables: op.variables },
                },
              },
            },
          },
        },
        responses: responses('#/components/schemas/GraphQLResponse', {
          data: { [op.name]: op.kind === 'query' ? { __typename: 'Object' } : true },
        }),
        'x-apidog-folder': tag,
        'x-apidog-actual-path': '/graphql',
        'x-apidog-testcases': apidogTestCases([
          {
            name: `TC01 — ${op.name}`,
            status: 200,
            request: { body: { query: op.query, variables: op.variables } },
          },
        ]),
      },
    };
  }
  return paths;
}

const MODULES = [
  {
    key: 'Customer',
    title: 'Customer API',
    file: 'tomago-customer-api.openapi.json',
    intro: `# Customer API

GraphQL + REST for the Tomago **website / storefront** (like Medusa **Store API**).

## Base URLs

| Environment | URL |
|-------------|-----|
| Staging | \`${STAGING}\` |
| Production | \`${PROD}\` |

## Auth

1. \`POST /api/auth/login\` → JWT + \`authenticationUid\`
2. \`POST /api/auth/token\` → Firebase \`idToken\`
3. GraphQL: \`Authorization: Bearer <idToken>\`

Requires \`accountType: customer\` for authenticated ops.

## Seed user

\`ahmed.ali@tomoga.demo\` / \`TomogaDemo123!\` (after seed with auth)
`,
  },
  {
    key: 'Admin',
    title: 'Admin API',
    file: 'tomago-admin-api.openapi.json',
    intro: `# Admin API

GraphQL + REST for the Tomago **dashboard** (like Medusa **Admin API**).

## Base URLs

| Environment | URL |
|-------------|-----|
| Staging | \`${STAGING}\` |
| Production | \`${PROD}\` |

## Auth

1. Login → 2. Get Firebase Token → 3. GraphQL

Requires admin/owner account with dashboard roles.

## Seed user

\`admin@tomoga.demo\` / \`TomogaAdmin123!\` (after seed with auth)
`,
  },
];

function buildModuleSpec(ops, module) {
  const gqlPaths = buildGqlPaths(ops, module.key);
  const resourceTags = [
    ...new Set(Object.values(gqlPaths).map((p) => p.post.tags[0])),
  ];
  const tags = [
    { name: 'Authentication', description: 'Login, Firebase token, refresh, logout.' },
    { name: 'Utilities', description: 'Health and file upload.' },
    ...resourceTags.map((t) => ({ name: t, description: `${module.key} — ${t}` })),
  ];

  return {
    openapi: '3.0.3',
    info: {
      title: module.title,
      version: '1.0.0',
      description: module.intro,
      contact: { name: 'Tomago', url: STAGING },
    },
    servers: [
      { url: STAGING, description: 'Staging' },
      { url: PROD, description: 'Production' },
    ],
    tags,
    'x-tagGroups': [
      { name: 'Getting Started', tags: ['Authentication', 'Utilities'] },
      { name: 'Resources', tags: resourceTags },
    ],
    paths: {
      ...buildAuthPaths(),
      ...buildUtilityPaths(),
      ...gqlPaths,
    },
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase ID token from POST /api/auth/token',
        },
      },
    },
  };
}

function main() {
  const ops = loadOps();
  const outDir = path.join(__dirname, '../docs/openapi');
  fs.mkdirSync(outDir, { recursive: true });

  const extraDirs = process.argv.slice(2).filter(Boolean);
  const moduleSpecs = {};

  for (const module of MODULES) {
    const spec = buildModuleSpec(ops, module);
    moduleSpecs[module.title] = spec;
    const outs = [path.join(outDir, module.file), ...extraDirs.map((d) => path.join(d, module.file))];
    for (const out of outs) {
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, JSON.stringify(spec, null, 2));
      console.log(`Wrote ${out} (${Object.keys(spec.paths).length} paths) — ${module.title}`);
    }
  }

  const combined = {
    openapi: '3.0.3',
    info: {
      title: 'Tomago API',
      version: '1.0.0',
      description: `# Tomago API

Import these modules into Apidog for Medusa-style tabs:

| Tab | File |
|-----|------|
| **Customer API** | \`tomago-customer-api.openapi.json\` |
| **Admin API** | \`tomago-admin-api.openapi.json\` |

Base: \`${STAGING}\`
`,
    },
    servers: [
      { url: STAGING, description: 'Staging' },
      { url: PROD, description: 'Production' },
    ],
    tags: [
      { name: 'Customer API', description: 'Storefront' },
      { name: 'Admin API', description: 'Dashboard' },
    ],
    paths: {},
    components: { schemas, securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
  };

  const combinedOuts = [
    path.join(outDir, 'tomago-api.openapi.json'),
    ...extraDirs.map((d) => path.join(d, 'tomago-api.openapi.json')),
  ];
  for (const out of combinedOuts) {
    fs.writeFileSync(out, JSON.stringify(combined, null, 2));
    console.log('Wrote', out);
  }

  const readme = `# Tomago OpenAPI — Apidog modules

Like Medusa (**Store API** | **Admin API**):

| Tab | File |
|-----|------|
| **Customer API** | \`tomago-customer-api.openapi.json\` |
| **Admin API** | \`tomago-admin-api.openapi.json\` |

## Import into Apidog

1. Create project (General Mode)
2. **Import** → **OpenAPI/Swagger**
3. Import each file with **Create a new module**
4. Publish Docs → top modules: Customer API | Admin API

## Regenerate

\`\`\`bash
node scripts/generate-postman-collection.js
node scripts/generate-openapi.js
node scripts/generate-openapi.js "$HOME/Downloads/tomago-openapi"
\`\`\`

## Servers

- Staging: \`${STAGING}\`
- Production: \`${PROD}\`

## Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tomoga.demo | TomogaAdmin123! |
| Customer | ahmed.ali@tomoga.demo | TomogaDemo123! |
`;
  fs.writeFileSync(path.join(outDir, 'README.md'), readme);
  for (const d of extraDirs) {
    fs.writeFileSync(path.join(d, 'README.md'), readme);
  }
  console.log('Wrote README');
}

main();
