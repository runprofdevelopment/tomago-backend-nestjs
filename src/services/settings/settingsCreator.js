const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
// const Settings = require('../../database/models/settings');
const { DEFAULT_SETTINGS, DEFAULT_ID, COLLECTION_NAME } = require('./defaultSettings');

module.exports = class SettingsCreator {
  static async createDefault(data, context) {
    try {
      // data = {
      //   id: DEFAULT_ID,
      //   ...this.model.cast(data),
      // };
      data = { ...DEFAULT_SETTINGS, ...data };

      const batch = await FirebaseHelper.createBatch();
      const repository = new FirestoreRepository(COLLECTION_NAME);
      const record = await repository.createDocument(data, {
        batch,
        currentUser: context.currentUser,
        language: context.language, 
      });
      await FirebaseHelper.commitBatch(batch);

      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }
};