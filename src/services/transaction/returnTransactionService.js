const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Transaction = require('../../database/models/transaction');
const EncryptionService = require('../encryptionService')

module.exports = class ReturnTransactionService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Transaction();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async refundTransactionService(data, Batch) {
    try {
      let transaction_data = {
        id: FirebaseHelper.newIdNumber(),
        amount: data['refundAmount'],
        type: 'walletRefund',
        userID: data['userID'],
        payerId: '1',
        payeeId: data['userID'],
        operation_details: {
          operation: data.type,
          id: data['id']
        }
      }
      transaction_data = this.model.cast(transaction_data)
      await this.repository.createDocument(transaction_data, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language
      });
      return transaction_data['id']
    }
    catch (e) {
      throw e
    }
  }
};