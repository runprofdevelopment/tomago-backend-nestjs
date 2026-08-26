const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const { COLLECTION_NAME, DECOOPA_ACCOUNT } = require('./model');

module.exports = class AccountManager {
  static async initAccount(context) {
    try {
      const repository = new FirestoreRepository(COLLECTION_NAME);

      const batch = await FirebaseHelper.createBatch();
      const record = await repository.createDocument(DECOOPA_ACCOUNT, {
        batch,
        currentUser: context.currentUser,
        language: context.language
      });
      await FirebaseHelper.commitBatch(batch);

      return await repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }
};