const AbstractEntityModel = require('../models/abstractEntityModel');

/** Models backing GraphQL list endpoints with sort: [SortInput!] */
const LIST_ENDPOINT_MODELS = [
  require('../models/brand'),
  require('../models/order'),
  require('../models/category'),
  require('../models/review'),
  require('../models/product-variant'),
  require('../models/wallet'),
  require('../models/voucher'),
  require('../models/ad'),
  require('../models/deal'),
  require('../models/contactUs'),
  require('../models/user'),
  require('../models/transaction'),
  require('../models/notification'),
  require('../models/returnRequest'),
  require('../models/withdrawalRequest'),
  require('../models/address'),
  require('../models/product-variant-options'),
  require('../models/collection'),
  require('../models/project'),
  require('../models/show-room'),
  require('../models/customRequest'),
  require('../models/slider'),
  require('../models/paymentMethod'),
  require('../models/product'),
];

const METADATA_SORT_FIELDS = ['id', 'createdAt', 'updatedAt'];

/** @type {Map<string, Set<string>>} */
const registry = new Map();

for (const ModelClass of LIST_ENDPOINT_MODELS) {
  const model = new ModelClass();
  registry.set(model.collectionName, new Set(model.getSortableFields()));
}

/**
 * @param {string} collectionPath
 * @returns {string}
 */
function extractCollectionKey(collectionPath) {
  if (!collectionPath || typeof collectionPath !== 'string') {
    return '';
  }

  const parts = collectionPath.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : collectionPath;
}

/**
 * @param {string} collectionPath
 * @returns {Set<string>}
 */
function getAllowedOrderByFields(collectionPath) {
  const key = extractCollectionKey(collectionPath);
  if (registry.has(key)) {
    return registry.get(key);
  }

  return new Set(METADATA_SORT_FIELDS);
}

/**
 * @param {string} collectionPath
 * @returns {string[]}
 */
function listAllowedOrderByFields(collectionPath) {
  return [...getAllowedOrderByFields(collectionPath)].sort();
}

/**
 * @param {string} collectionPath
 * @param {string} orderBy
 */
function assertValidOrderBy(collectionPath, orderBy) {
  const key = extractCollectionKey(collectionPath);
  const allowed = getAllowedOrderByFields(collectionPath);

  if (!allowed.has(orderBy)) {
    const allowedList = [...allowed].sort().join(', ');
    throw new Error(
      `Invalid orderBy "${orderBy}" for collection "${key}". Allowed fields: ${allowedList}`,
    );
  }
}

/**
 * @param {string} collectionPath
 * @param {Array<{ field?: string, order?: string }>|undefined|null} sort
 * @returns {{ sort: Array<{ field: string, order: 'asc'|'desc' }> }}
 */
function normalizeSortArray(collectionPath, sort) {
  const { resolveFirestoreSorts } = require('./sort.util');
  const sorts = resolveFirestoreSorts({ sort }, { collectionPath });
  return {
    sort: sorts.map(({ field, direction }) => ({
      field,
      order: direction,
    })),
  };
}

module.exports = {
  registry,
  extractCollectionKey,
  getAllowedOrderByFields,
  listAllowedOrderByFields,
  assertValidOrderBy,
  normalizeSortArray,
  METADATA_SORT_FIELDS,
};
