const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Option = require('../../database/models/product-variant-options');

module.exports = class OptionViewer {
  constructor() {
    // this.currentUser = context && context.currentUser;
    // this.language = context && context.language;
    this.model = new Option();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }
  
  /**
   * Retrieve a Option Item by ID
   * @param {String} id Option Item ID (Required)
   * @returns {Promise<JSON>} Option record
   */
  async findById(id) {
    const record = await this.repository.findDocumentById(id);
    return record;
  }

  /**
   * @param {String} orderBy 
   * @param {'asc'|'desc'} sortBy
   * @returns {Promise<JSON[]>}
   */
  async listAll(orderBy, sortBy) {
    const filter = [];
    const ORDER_BY = orderBy || 'createdAt';
    const SORT_BY = sortBy || 'desc';
    const records = await FirebaseHelper.listCollection(this.collectionName, filter, ORDER_BY, SORT_BY);
    return records;
  }

  /**
   * @param {{ id: String, values: JSON[] } []} options 
   */
  async listWithValues(options) {
    return await Promise.all(
      options.map(option => this.#findByIdWithValues(option.id, option.values))
    );
  }

  async #findByIdWithValues(id, values) {
    const record = await this.repository.findDocumentById(id);

    if (!record) throw new Error(`There is no option present related to this ID ${id}`);
    return {
      ...record,
      values
    }
  }
};