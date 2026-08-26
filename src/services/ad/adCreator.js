const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Ad = require('../../database/models/ad');

module.exports = class AdCreator {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Ad();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async execute(data) {
    try {
      this._validate(data);
      data = this.model.cast(data);

      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }

  _validate(data) {
    if (!data.title) throw new Error(`title is Required`);
    if (!data.body_html) throw new Error(`body_html is Required`);
  }
}