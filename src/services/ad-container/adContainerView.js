const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const AdContainerCreator = require('./adContainerCreator');
const { DEFAULT_SETTINGS, COLLECTION_NAME } = require('./models');

module.exports = class AdContainerView {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(COLLECTION_NAME);
  }
  
  async findOrCreateDefault(id) {
    const first = await this.repository.findDocumentById(id);

    if (first) {
      return first;
    }

    const record = await AdContainerCreator.createDefault(id, {}, this.context);
    return record;
  }
};