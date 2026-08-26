const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const { COLLECTION_NAME, BannerAd, VideoAd } = require('./models');

module.exports = class AdContainerCreator {
  static async createDefault(id, data, context) {
    try {
      this.id = id;
      data = { ...data, ...this.DEFAULT_MODEL };

      const batch = await FirebaseHelper.createBatch();
      const repository = new FirestoreRepository(COLLECTION_NAME);
      const record = await repository.createDocument(data, {
        batch,
        currentUser: context.currentUser,
        language: context.language, 
      });
      await FirebaseHelper.commitBatch(batch);

      return await repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }

  static get DEFAULT_MODEL() {
    if (this.id == BannerAd.id) return BannerAd;
    if (this.id == VideoAd.id) return VideoAd;
  }
};