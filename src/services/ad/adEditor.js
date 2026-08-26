// const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Ad = require('../../database/models/ad');

module.exports = class AdEditor {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Ad()
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async execute(id, data) {
    try {
      this._validate(data);
      data = this.model.cast(data);

      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(id);
    } catch (error) {
      throw error;
    }
  }



  _validate(data) {
    if ('title' in data && !data.title) throw new Error(`title is Required`);
    if ('body_html' in data && !data.body_html) throw new Error(`body_html is Required`);
  }
}