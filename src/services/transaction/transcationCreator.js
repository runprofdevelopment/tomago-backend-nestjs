const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Transaction = require('../../database/models/transaction');

module.exports = class TransactionCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Transaction();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async createTransaction(data) {
    try {
      data['id'] = FirebaseHelper.newIdNumber()
      data = this.model.cast(data)
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch)
      return await this.repository.findDocumentById(record.id);
    }
    catch (e) {
      throw e
    }
  }
};