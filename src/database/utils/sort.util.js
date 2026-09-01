const SortableFieldsRegistry = require('./sortableFieldsRegistry');

/**
 * @typedef {{ field: string, direction: 'asc'|'desc' }} FirestoreSortSpec
 */

/**
 * @param {string|undefined|null} value
 * @returns {'asc'|'desc'}
 */
function normalizeSortDirection(value) {
  return value === 'desc' ? 'desc' : 'asc';
}

/**
 * @param {Object} params
 * @param {Array<{ field?: string, order?: string }>|undefined|null} params.sort
 * @param {string} params.collectionPath
 * @param {string} [params.defaultField]
 * @param {'asc'|'desc'} [params.defaultDirection]
 * @returns {FirestoreSortSpec[]}
 */
function resolveFirestoreSorts(
  { sort },
  {
    collectionPath,
    defaultField = 'createdAt',
    defaultDirection = 'asc',
  } = {},
) {
  if (!Array.isArray(sort) || sort.length === 0) {
    SortableFieldsRegistry.assertValidOrderBy(collectionPath, defaultField);
    return [{ field: defaultField, direction: defaultDirection }];
  }

  return sort.map((entry) => {
    const field = entry && entry.field ? String(entry.field).trim() : '';
    if (!field) {
      throw new Error('Sort field is required');
    }

    SortableFieldsRegistry.assertValidOrderBy(collectionPath, field);

    return {
      field,
      direction: normalizeSortDirection(entry.order),
    };
  });
}

/**
 * @returns {FirestoreSortSpec[]}
 */
function sortsFromOrderBy({ collectionPath, orderBy, sortBy, defaultField, defaultDirection }) {
  const field =
    orderBy && String(orderBy).trim() ? String(orderBy).trim() : defaultField || 'createdAt';
  const direction = normalizeSortDirection(sortBy || defaultDirection);
  SortableFieldsRegistry.assertValidOrderBy(collectionPath, field);
  return [{ field, direction }];
}

module.exports = {
  normalizeSortDirection,
  resolveFirestoreSorts,
  sortsFromOrderBy,
};
