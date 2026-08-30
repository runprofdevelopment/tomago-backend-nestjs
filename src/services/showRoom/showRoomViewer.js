const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ShowRoom = require('../../database/models/show-room');

module.exports = class ShowRoomViewer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ShowRoom();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  /**
   * Retrieve a ShowRoom by ID
   * @param {String} id ShowRoom ID (Required)
   * @returns {Promise<JSON>} ShowRoom record
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
      'createdAt',
      'desc',
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
