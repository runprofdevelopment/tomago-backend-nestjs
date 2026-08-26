const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Order = require('../../database/models/returnRequest');

module.exports = class RequestReturnEditor {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Order()
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }
  
  async _preSave(data) {
    const model = this.model.cast(data)
    Object.keys(model).forEach((key) => {
      if (!(key in data)) delete model[key]
    })
    data = model
  }

  async update(data, Batch) {
    try {
      const batch = Batch || await FirebaseHelper.createBatch();
      await this.repository.updateDocument(data.id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      if (!Batch) await FirebaseHelper.commitBatch(batch);
      // return await new OrderViewer(this).findById(record.id);
    } catch (error) {
      throw error;
    }
  }
}