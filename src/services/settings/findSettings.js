const Settings = require('../../database/models/settings');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');

module.exports = class FindSettings {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Settings();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }
  async findSettings() {
    const record = await this.repository.findDocumentById(
      'Settings',
    );
    return record;
  }
};
