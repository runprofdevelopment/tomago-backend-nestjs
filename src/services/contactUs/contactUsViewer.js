const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ContactUs = require('../../database/models/contactUs');

module.exports = class ContactUsViewer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ContactUs();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }
  
  /**
   * Retrieve a ContactUs Item by ID
   * @param {String} id ContactUs Item ID (Required)
   * @returns {Promise<JSON>} ContactUs record
   */
  async findById(id) {
    const record = await this.repository.findDocumentById(id);
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
   * @returns {Promise<JSON[]>}
   */
  async listAll() {
    const filter = [];
    const response = await FirebaseHelper.listCollection(this.collectionName, filter, [{ field: 'createdAt', order: 'desc' }]);
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
    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows); // Find Relations
    return response
  }

  /**
   * Populates the records with all its relations.
   * @param {JSON[]} records
   */
  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record))
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