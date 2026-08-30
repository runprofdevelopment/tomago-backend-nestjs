const lodash = require('lodash');
const admin = require('firebase-admin');
const AuditLogRepository = require('./auditLogRepository');
const FirebaseHelper = require('../utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');


/** Handles firestore operations for the any collection. */
class FirestoreRepository {
  constructor(collectionName) {
    this._collectionName = collectionName
  }

  /**
   * @param {String} newValue
   */
  set collectionName(newValue) {
    if (lodash.isEmpty(newValue) || !lodash.isString(newValue)) {
      throw new Error("The 'collectionName' must be a string");
    }
    this._collectionName = newValue;
    console.log('_collectionName =', this._collectionName);
  }

  /**
   * Create the document in firestore collection.
   * @param {JSON} data
   * @param {Object} [options]
   * @param {JSON} options.currentUser
   * @param {Batch} options.batch
   * @param {String} options.language
   */
  async createDocument(data, { currentUser, language, batch, collectionPath }) {
    const options = { currentUser, language, batch, collectionPath };
    const record = {
      ...data,
      id: data.id || FirebaseHelper.newId(),
      createdBy: FirebaseHelper.getCurrentUser(options).id,
      createdAt: FirebaseHelper.serverTimestamp(),
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
      deletedAt: null,
      deletedBy: null,
    };

    // const COLLECTION_PATH = (options && options.collectionPath) || this._collectionName;
    this._collectionName = (options && options.collectionPath) || this._collectionName;
    await FirebaseHelper.executeOrAddToBatch(
      'set',
      admin.firestore().doc(`${this._collectionName}/${record.id}`),
      record,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.CREATE,
      record.id,
      data,
      options,
    );

    // await this.refreshTwoWayRelations(record, options);
    return record;
  }

  /**
  * Updates the document in firestore collection.
  * @param {String} id
  * @param {JSON} data
  * @param {Object} [options]
  * @param {JSON} options.currentUser
  * @param {Batch} options.batch
  * @param {String} options.language
  */
  async updateDocument(id, data, { currentUser, language, batch, collectionPath }) {
    const options = { currentUser, language, batch, collectionPath };
    const record = {
      id,
      ...data,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    // const COLLECTION_PATH = (options && options.collectionPath) || this._collectionName;
    this._collectionName = (options && options.collectionPath) || this._collectionName;
    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`${this._collectionName}/${record.id}`),
      record,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.UPDATE,
      id,
      data,
      options,
    );

    // await this.refreshTwoWayRelations(record, options);
    return record;
  }

  async updateManyDocuments(ids, data, { currentUser, language, collectionPath }) {
    const maximumWritesPerBatch = 500
    const numOfRequests = Math.ceil(ids.length / maximumWritesPerBatch)
    collectionPath = collectionPath || this._collectionName;

    for (let index = 0; index < numOfRequests; index++) {
      const Start = maximumWritesPerBatch * index
      const End = maximumWritesPerBatch * (index + 1)
      const Chunks = ids.slice(Start, End);
      
      const batch = await FirebaseHelper.createBatch();
      await Promise.allSettled(
        Chunks.map(id => this.updateDocument(id, data, {
          batch,
          currentUser,
          language,
          collectionPath,
        }))
      );
      await FirebaseHelper.commitBatch(batch);
    }
  }

  /**
   * Delete the document from firestore collection.
   * @param {String} id 
   * @param {Object} [options]
   * @param {JSON} options.currentUser
   * @param {Batch} options.batch
   * @param {String} options.language
   */
  async destroyDocument(id, { currentUser, language, batch, collectionPath }) {
    const options = { currentUser, language, batch, collectionPath };

    this._collectionName = (options && options.collectionPath) || this._collectionName;
    const record = {
      deletedAt: FirebaseHelper.serverTimestamp(),
      deletedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`${this._collectionName}/${id}`),
      record,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.DELETE,
      id,
      record,
      options,
    );
    // await this.destroyFromRelations(id, options);
  }

  async findDocumentById(id, options = {}) {
    const record = await FirebaseHelper.findDocument(this._collectionName, id, options);
    return record
  }

  async listCollection({ filter, orderBy, pagination, includeDeleted = false }) {
    return await FirebaseHelper.listWithPagination({
      collectionPath: this._collectionName,
      filter: filter,
      orderBy,
      pagination,
      queryType: 'single',
      includeDeleted,
    })
  }

  async listCollectionGroup(collectionName, { filter, orderBy, pagination, includeDeleted = false }) {
    return await FirebaseHelper.listWithPagination({
      collectionPath: collectionName,
      filter: filter,
      orderBy,
      pagination,
      queryType: 'group',
      includeDeleted,
    })
  }
  
  generateFilter(filter) {
    const filters = []

    if (filter) {
      if (filter.id) {
        filters.push({ field: 'id', operator: 'equal', value: filter.id })
        return filters
      }

      if (filter.exact_name) {
        const language = filter.exact_name.lang || ''
        const value = filter.exact_name.value || ''
        filters.push({ field: `name.${language}`, operator: 'equal', value: value })
        return filters
      }
      if (filter.name) {
        const language = filter.name.lang || ''
        const value = filter.title.value || ''
        const searchField = `normalizeName.${language}`
        const searchText = HelperFunctions.stringNormalization(value, language)
        filters.push({ field: searchField, operator: 'like', value: searchText })
        return filters
      }

      if (filter.createdAt) {
        filters.push({ field: 'createdAt', operator: 'equal', value: filter.createdAt })
        return filters
      } 
      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;
        console.log('start =', moment(start).format('YYYY-MM-DD'));
        console.log('end =', moment(end).format('YYYY-MM-DD'));
        filters.push({ field: 'createdAt', operator: '>=', value: start })
        filters.push({ field: 'createdAt', operator: '<=', value: end })
        return filters
      }
      if (filter.month && filter.year) {
        assert(lodash.isInteger(filter.month), `Variable "filter.month" got invalid value ${filter.month}; Expected type Integer; Integer cannot represent a non integer value: ${filter.month}`);
        assert(filter.month >= 1 && filter.month <= 12, `Variable "filter.month" got invalid value ${filter.month}; The expected value between [1 - 12]`);
        assert(lodash.isInteger(filter.year), `Variable "filter.year" got invalid value ${filter.year}; Expected type Integer; Integer cannot represent a non integer value: ${filter.year}`);
        assert(filter.year.toString().length == 4, `Variable "filter.year" got invalid value ${filter.year}; The value must consist of 4 digits`);

        const startDate = new Date(filter.year, filter.month - 1, 1);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        filters.push({ field: 'createdAt', operator: '>=', value: startDate })
        filters.push({ field: 'createdAt', operator: '<=', value: endDate })

        console.log('Start Date =', moment(startDate).format('YYYY-MM-DD'));
        console.log('End Date =', moment(endDate).format('YYYY-MM-DD'));
      }
    }  

    return filters
  }

  /**
  * Creates an auditLogs of the operation.
  * @param {'create'|'update'|'delete'} action The action [create, update or delete].
  * @param {String} id The record id
  * @param {JSON} data The new data passed on the request
  * @param {object} options
  * @param {JSON} options.currentUser
  * @param {Batch} options.batch
  * @param {String} options.language
  */
  async _auditLogs(action, id, data, options) {
    await AuditLogRepository.log({
      entityName: this._collectionName,
      entityId: id,
      action,
      values: data,
    }, options);
  }
}

module.exports = FirestoreRepository;