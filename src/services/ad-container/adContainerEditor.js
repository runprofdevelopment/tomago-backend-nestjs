const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AdContainerCreator = require('./adContainerCreator');
const { COLLECTION_NAME, BannerAd, VideoAd, TargetPageEnum } = require('./models');

module.exports = class AdContainerEditor {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(COLLECTION_NAME);
  }

  async save(id, data) {
    this.id = id;

    try {
      this._validate(data);
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);
      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      if (error.code === 5) {
        const record = await AdContainerCreator.createDefault(id, data, this.context);
        return record;
      }

      throw error;
    }
  }

  _validate(data) {
    if (this.id !== BannerAd.id && this.id !== VideoAd.id) {
      throw new Error(`Invalid ID`);
    }

    if (this.id === BannerAd.id && !data.content) {
      throw new Error(`The Banner Ad must have content.`);
    }
    if (this.id === BannerAd.id && !data.textColor) {
      throw new Error(`The Banner Ad must have textColor.`);
    }
    if (this.id === BannerAd.id && !data.backgroundColor) {
      throw new Error(`The Banner Ad must have backgroundColor.`);
    }

    if (this.id === VideoAd.id && (!data.video || !data.video.publicUrl)) {
      throw new Error(`The Video Ad must have publicUrl of video.`);
    }

    if ('targetView' in data && data.targetView !== null && !TargetPageEnum.includes(data.targetView)) {
      throw new Error(`Invalid target view. Please enter a valid target view ${TargetPageEnum}.`);
    }
  }
};