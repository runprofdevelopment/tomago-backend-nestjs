const lodash = require('lodash');
const ExcelJS = require('exceljs');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const erdCollectionMap = require('../../database/erdCollectionMap');
const ForbiddenError = require('../../errors/forbiddenError');
const ErrorHandler = require('../../errors/errorHandler');

const EXTRA_COLLECTIONS = [
  'inventory',
  'product-variants',
  'cart',
  'notification',
  'invoice',
  'auditLogs',
  'shipment',
];

const BLOCKED_COLLECTIONS = new Set(['OTP-code']);

function buildCollectionAliases() {
  const aliases = {};
  const exportable = new Set();

  Object.entries(erdCollectionMap).forEach(([alias, collectionName]) => {
    if (!collectionName || String(collectionName).includes('{')) {
      return;
    }
    if (BLOCKED_COLLECTIONS.has(collectionName)) {
      return;
    }
    exportable.add(collectionName);
    aliases[alias] = collectionName;
    aliases[collectionName] = collectionName;
  });

  EXTRA_COLLECTIONS.forEach((collectionName) => {
    exportable.add(collectionName);
    aliases[collectionName] = collectionName;
  });

  aliases.users = 'user';
  aliases.shipments = 'shipment';
  aliases.inventories = 'inventory';

  return { aliases, exportable };
}

const { aliases: COLLECTION_ALIASES, exportable: EXPORTABLE_COLLECTIONS } =
  buildCollectionAliases();

function isPlainObject(value) {
  return (
    lodash.isPlainObject(value) &&
    !(value instanceof Date)
  );
}

function serializeCell(value) {
  if (value == null) {
    return '';
  }
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) || isPlainObject(value)) {
    return JSON.stringify(value);
  }
  return String(value);
}

function flattenDocument(doc, prefix = '', acc = {}) {
  if (!doc || typeof doc !== 'object') {
    return acc;
  }

  Object.keys(doc).forEach((key) => {
    const value = doc[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value.toDate === 'function') {
      acc[path] = value.toDate().toISOString();
      return;
    }
    if (value instanceof Date) {
      acc[path] = value.toISOString();
      return;
    }
    if (Array.isArray(value)) {
      acc[path] = JSON.stringify(value);
      return;
    }
    if (isPlainObject(value)) {
      flattenDocument(value, path, acc);
      return;
    }
    acc[path] = value == null ? '' : value;
  });

  return acc;
}

function normalizeStringArray(value, fieldName) {
  if (value == null || value === '') {
    return [];
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(value)) {
    throw new ErrorHandler({
      errorCode: 400,
      message: `"${fieldName}" must be an array of strings`,
    });
  }
  return value
    .map((item) => (item == null ? '' : String(item).trim()))
    .filter(Boolean);
}

module.exports = class ExcelExportService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
  }

  /**
   * @param {Object} args
   * @param {String} args.collection
   * @param {String[]|String} [args.fields]
   * @param {String[]|String} [args.ids]
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string, count: number }>}
   */
  async export({ collection, fields, ids }) {
    this._assertAdmin();

    const collectionName = this._resolveCollection(collection);
    const selectedFields = normalizeStringArray(fields, 'fields');
    const selectedIds = normalizeStringArray(ids, 'ids');

    const records = await this._fetchRecords(collectionName, selectedIds);
    const columns = this._resolveColumns(records, selectedFields);
    const workbook = this._buildWorkbook(records, columns, collectionName);
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${collectionName}-export-${Date.now()}.xlsx`;

    return {
      buffer,
      fileName,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      count: records.length,
    };
  }

  static listExportableCollections() {
    return [...EXPORTABLE_COLLECTIONS].sort();
  }

  _assertAdmin() {
    if (!this.currentUser || !this.currentUser.id) {
      throw new ForbiddenError(this.language);
    }
    if (this.currentUser.accountType === 'customer') {
      throw new ForbiddenError(this.language);
    }
  }

  _resolveCollection(collection) {
    if (lodash.isEmpty(collection) || !lodash.isString(collection)) {
      throw new ErrorHandler({
        errorCode: 400,
        message: 'collection is required',
      });
    }

    const key = collection.trim();
    const collectionName = COLLECTION_ALIASES[key];

    if (!collectionName || !EXPORTABLE_COLLECTIONS.has(collectionName)) {
      throw new ErrorHandler({
        errorCode: 400,
        message: `Unknown collection "${key}"`,
      });
    }

    return collectionName;
  }

  async _fetchRecords(collectionName, ids) {
    if (ids.length) {
      return FirebaseHelper.findDocuments(collectionName, ids);
    }

    return FirebaseHelper.listCollection(collectionName, [], '', 'asc');
  }

  _resolveColumns(records, fields) {
    if (fields.length) {
      return fields;
    }

    const keys = new Set();
    records.forEach((record) => {
      Object.keys(flattenDocument(record)).forEach((key) => keys.add(key));
    });

    const columns = [...keys].sort();
    const idIndex = columns.indexOf('id');
    if (idIndex > 0) {
      columns.splice(idIndex, 1);
      columns.unshift('id');
    } else if (idIndex === -1) {
      columns.unshift('id');
    }

    return columns;
  }

  _buildWorkbook(records, columns, collectionName) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tomoga';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(collectionName.slice(0, 31) || 'export');
    sheet.columns = columns.map((key) => ({
      header: key,
      key,
      width: Math.min(Math.max(key.length + 4, 18), 40),
    }));

    records.forEach((record) => {
      const flattened = flattenDocument(record);
      const row = {};
      columns.forEach((column) => {
        const value =
          flattened[column] !== undefined
            ? flattened[column]
            : lodash.get(record, column);
        row[column] = serializeCell(value);
      });
      sheet.addRow(row);
    });

    if (sheet.rowCount > 0) {
      sheet.getRow(1).font = { bold: true };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length || 1 },
      };
    }

    return workbook;
  }
};
