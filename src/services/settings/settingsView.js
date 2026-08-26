const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const SettingsCreator = require('./settingsCreator');
const { DEFAULT_ID, COLLECTION_NAME } = require('./defaultSettings');

module.exports = class SettingsView {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(COLLECTION_NAME);
  }
  
  async findOrCreateDefault() {
    const first = await this.repository.findDocumentById(DEFAULT_ID);

    if (first) {
      return first;
    }

    const record = await SettingsCreator.createDefault({}, this.context);
    return record;
  }
};