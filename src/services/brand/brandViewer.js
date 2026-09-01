const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Brand = require('../../database/models/brand');

module.exports = class BrandViewer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Brand();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  /**
   * Retrieve a Brand Item by ID
   * @param {String} id Brand Item ID (Required)
   * @returns {Promise<JSON>} Brand record
   */
  async findById(id) {
    const record = await this.repository.findDocumentById(
      id,
    );
    return await this.populate(record);
  }

  /**
   * @param {Object} args
   * @param {JSON} args.filter
   * @param {String} args.orderBy
   * @param {Object} args.pagination
   * @param {Number} args.pagination.page
   * @param {Number} args.pagination.offset
   * @param {JSON} args.pagination.doc
   * @param {Number} args.pagination.limit
   * @param {'asc'|'desc'} args.pagination.sortBy
   * @param {'current'|'next'|'prev'} args.pagination.action
   * @returns {Promise}
   */
  async listActiveItems() {
    const filter = [
      { field: 'isActive', operator: 'equal', value: true },
    ];
    const records = await FirebaseHelper.listCollection(
      this.collectionName,
      filter,
[{ field: 'createdAt', order: 'desc' }],
    );
    return await Promise.all(
      records.map((record) => this.populateActive(record)),
    );
  }

  /**
   * @param {Object} args
   * @param {JSON} args.filter
   * @param {String} args.orderBy
   * @param {Object} args.pagination
   * @param {Number} args.pagination.page
   * @param {Number} args.pagination.offset
   * @param {JSON} args.pagination.doc
   * @param {Number} args.pagination.limit
   * @param {'asc'|'desc'} args.pagination.sortBy
   * @param {'current'|'next'|'prev'} args.pagination.action
   * @returns {Promise<JSON[]>}
   */
  async listAll() {
    const filter = [];
    const response = await FirebaseHelper.listCollection(
      this.collectionName,
      filter,
      [{ field: 'createdAt', order: 'desc' }],
    );
    return await this.populateAll(response); // Find Relations
  }

  /**
   * @param {Object} args
   * @param {JSON} args.filter
   * @param {String} args.orderBy
   * @param {Object} args.pagination
   * @param {Number} args.pagination.page
   * @param {Number} args.pagination.offset
   * @param {JSON} args.pagination.doc
   * @param {Number} args.pagination.limit
   * @param {'asc'|'desc'} args.pagination.sortBy
   * @param {'current'|'next'|'prev'} args.pagination.action
   * @returns {Promise}
   */
  async listWithPagination(args) {
    const response = await this.repository.listCollection(
      args,
    );
    response.rows = await this.populateAll(response.rows); // Find Relations
    return response;
  }

  /**
   * Populates the records with all its relations.
   * @param {JSON[]} records
   */
  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

  /**
   * Populates the record with all its relations.
   * @param {JSON} record
   */
  async populate(record) {
    if (!record) {
      return record;
    }
    return record;
  }

  async populateActive(record) {
    if (!record) {
      return record;
    }
    return record;
  }
};
