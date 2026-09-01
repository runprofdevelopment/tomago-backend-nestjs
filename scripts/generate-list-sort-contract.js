#!/usr/bin/env node
/**
 * Regenerates docs/list-sort-api-contract.json from sortableFieldsRegistry.
 * Run: node scripts/generate-list-sort-contract.js
 */
const fs = require('fs');
const path = require('path');
const { registry } = require('../src/database/utils/sortableFieldsRegistry');

const LEGACY_DEFAULT_SORT = [{ field: 'createdAt', order: 'asc' }];
const SLIDER_DEFAULT_SORT = [{ field: 'createdAt', order: 'desc' }];

const ENDPOINTS = [
  { query: 'adList', collection: 'ads' },
  { query: 'brandList', collection: 'brand' },
  { query: 'categoryList', collection: 'category' },
  { query: 'collectionList', collection: 'collection' },
  { query: 'contactUsList', collection: 'contactUs' },
  { query: 'customRequestList', collection: 'customRequest' },
  { query: 'myCustomRequests', collection: 'customRequest' },
  { query: 'dealList', collection: 'deal' },
  { query: 'adminList', collection: 'user' },
  { query: 'customerList', collection: 'user' },
  { query: 'inventoryList', collection: 'product-variants' },
  { query: 'inventoryListArchivedItems', collection: 'product-variants' },
  { query: 'listMyNotifications', collection: 'notification' },
  { query: 'orderList', collection: 'order' },
  { query: 'listCustomerOrders', collection: 'order' },
  { query: 'myBillingHistory', collection: 'order' },
  { query: 'projectList', collection: 'project' },
  { query: 'reviewList', collection: 'reviews' },
  { query: 'listCustomerReviews', collection: 'reviews' },
  { query: 'showRoomList', collection: 'showRoom' },
  { query: 'transactionList', collection: 'transaction' },
  { query: 'listMyTransactions', collection: 'transaction' },
  { query: 'listDecoopaAccountTransactions', collection: 'transaction' },
  { query: 'voucherList', collection: 'voucher' },
  { query: 'walletList', collection: 'wallet' },
  { query: 'withdrawalRequestsList', collection: 'withdrawalRequest' },
  { query: 'viewReturnRequests', collection: 'returnRequest' },
  { query: 'addressList', collection: 'addresses', noPagination: true },
  { query: 'listMyAddresses', collection: 'addresses', noPagination: true },
  { query: 'listCustomerAddresses', collection: 'addresses', noPagination: true },
  { query: 'optionList', collection: 'variants_options', noPagination: true },
  { query: 'findProductReviews', collection: 'reviews', noPagination: true },
  { query: 'sliderList', collection: 'slider', defaultSort: SLIDER_DEFAULT_SORT },
];

const EXCLUDED = [
  {
    query: 'auditLogList',
    reason: 'Uses AuditLogListOrderByEnum (field_ASC / field_DESC)',
  },
  {
    query: 'iamListRoles',
    reason: 'Uses RoleWithUsersOrderByEnum (field_ASC / field_DESC)',
  },
  {
    query: 'iamListUsers',
    reason: 'Uses UserWithRolesOrderByEnum (field_ASC / field_DESC)',
  },
  {
    query: 'brandListAll',
    reason: 'Non-paginated dump list — no sort arg',
  },
  {
    query: 'dealListAll',
    reason: 'Non-paginated dump list — no sort arg',
  },
  {
    query: 'adListAll',
    reason: 'Non-paginated dump list — no sort arg',
  },
  {
    query: 'contactUsListAll',
    reason: 'Non-paginated dump list — no sort arg',
  },
];

const collections = {};
for (const [name, fields] of registry.entries()) {
  collections[name] = [...fields].sort();
}

const contract = {
  version: '2.0.0',
  generatedAt: new Date().toISOString(),
  transport: {
    endpoint: 'POST /graphql',
    auth: 'Authorization: Bearer <Firebase ID token>',
  },
  defaultSort: LEGACY_DEFAULT_SORT,
  sliderDefaultSort: SLIDER_DEFAULT_SORT,
  sortInput: {
    field: 'String!',
    order: 'SortByEnum (asc | desc, default asc)',
  },
  enums: {
    SortByEnum: ['asc', 'desc'],
    ActionTypeEnum: ['next', 'prev', 'current'],
  },
  paginationInput: {
    limit: 'Int',
    offset: 'Int',
    page: 'Int',
    doc: 'JSON',
    action: 'ActionTypeEnum',
  },
  endpoints: ENDPOINTS.map((ep) => ({
    query: ep.query,
    sortArg: 'sort: [SortInput!]',
    paginationArg: ep.noPagination ? null : 'pagination: PaginationInput',
    defaultSort: ep.defaultSort || LEGACY_DEFAULT_SORT,
    allowedSortFields: collections[ep.collection] || ['id', 'createdAt', 'updatedAt'],
    collection: ep.collection,
  })),
  excludedEndpoints: EXCLUDED,
  collections,
  errors: {
    invalidSortField:
      'Invalid orderBy "{field}" for collection "{collection}". Allowed fields: {allowedList}',
    missingSortField: 'Sort field is required',
  },
};

const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const jsonPath = path.join(docsDir, 'list-sort-api-contract.json');
fs.writeFileSync(jsonPath, `${JSON.stringify(contract, null, 2)}\n`);
console.log(`Wrote ${jsonPath}`);

function rows(eps) {
  return eps.map((ep) => `| \`${ep.query}\` | \`${ep.collection}\` |`).join('\n');
}

const paginated = ENDPOINTS.filter((e) => !e.noPagination && e.query !== 'sliderList');
const nonPaginated = ENDPOINTS.filter((e) => e.noPagination);
const slider = ENDPOINTS.filter((e) => e.query === 'sliderList');

const md = `# List Sort API Contract

**Transport:** GraphQL over HTTP  
**Endpoint:** \`POST /graphql\`  
**Auth:** Firebase ID token — \`Authorization: Bearer <token>\`

Machine-readable: [\`list-sort-api-contract.json\`](./list-sort-api-contract.json)  
Regenerate: \`node scripts/generate-list-sort-contract.js\`

---

## Summary

List queries use **\`sort: [SortInput!]\`**:

\`\`\`graphql
input SortInput {
  field: String!
  order: SortByEnum   # asc | desc (default: asc)
}
\`\`\`

| When omitted | Default |
|--------------|---------|
| Most list endpoints | \`[{ field: "createdAt", order: asc }]\` |
| \`sliderList\` | \`[{ field: "createdAt", order: desc }]\` |

Pagination stays in \`PaginationInput\` — **without** \`sortBy\`.

---

## Paginated endpoints

${rows(paginated)}

## Non-paginated (sort only)

${rows(nonPaginated)}

## Slider

${rows(slider)}

---

## Excluded

${EXCLUDED.map((e) => `- \`${e.query}\` — ${e.reason}`).join('\n')}
`;

const mdPath = path.join(docsDir, 'list-sort-api-contract.md');
fs.writeFileSync(mdPath, md);
console.log(`Wrote ${mdPath}`);

const arMd = md
  .replace('# List Sort API Contract', '# عقد فرز قوائم API')
  .replace('Paginated endpoints', 'قوائم مع pagination')
  .replace('Non-paginated (sort only)', 'بدون pagination')
  .replace('Excluded', 'مستثنى');
fs.writeFileSync(path.join(docsDir, 'list-sort-api-contract.ar.md'), arMd);
console.log('Wrote list-sort-api-contract.ar.md');
