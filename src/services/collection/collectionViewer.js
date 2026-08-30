const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Collection = require('../../database/models/collection');

module.exports = class CollectionViewer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Collection();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  /**
   * Retrieve a Collection by ID
   * @param {String} id Collection ID (Required)
   * @returns {Promise<JSON>} Collection record
   */
  async findById(id) {
    const record = await this.repository.findDocumentById(
      id,
    );
    return await this.populate(record);
  }

  async listActiveItems() {
    const filter = [
      { field: 'isActive', operator: 'equal', value: true },
    ];
    const records = await FirebaseHelper.listCollection(
      this.collectionName,
      filter,
      'display_order',
      'asc',
    );
    return await Promise.all(
      records.map((record) => this.populateActive(record)),
    );
  }

  async listFeaturedItems() {
    const filter = [
      { field: 'isActive', operator: 'equal', value: true },
      { field: 'is_featured', operator: 'equal', value: true },
    ];
    const records = await FirebaseHelper.listCollection(
      this.collectionName,
      filter,
      'display_order',
      'asc',
    );
    return await Promise.all(
      records.map((record) => this.populateActive(record)),
    );
  }

  async listWithPagination(args) {
    const response = await this.repository.listCollection(
      args,
    );
    response.rows = await this.populateAll(response.rows);
    return response;
  }

  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

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
