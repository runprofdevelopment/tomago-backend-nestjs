const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Transaction = require('../../database/models/transaction');
const EncryptionService = require('../encryptionService');

module.exports = class AccountTransactionService {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Transaction();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async accountCreditTransaction({ accountId, amount }, Batch) {
    try {
      // const key = process.env.WALLET_BALANCE_KEY
      // const withdrawal_amount = parseFloat(await EncryptionService.decryptData(data['withdrawal_amount'], key));

      const transaction = this.model.cast({
        id: FirebaseHelper.newIdNumber(),
        type: 'accountCredit',
        amount: amount,
        // userID: accountId,
        userID: 'decoopa',
        payerId: '1',
        payeeId: '1',
        operation_details: {
          operation: 'decoopa-account',
          id: accountId,
        }
      });

      await this.repository.createDocument(transaction, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language
      });

      return transaction.id;
    } catch (error) {
      throw error;
    }
  }

  async accountDebitTransaction({ accountId, amount, note }, Batch) {
    try {
      // const key = process.env.WALLET_BALANCE_KEY
      // const withdrawal_amount = parseFloat(await EncryptionService.decryptData(data['withdrawal_amount'], key));

      const transaction = this.model.cast({
        id: FirebaseHelper.newIdNumber(),
        type: 'accountDebit',
        amount: amount,
        // userID: accountId,
        userID: 'decoopa',
        payerId: '1',
        payeeId: '1',
        note,
        operation_details: {
          operation: 'decoopa-account',
          id: accountId,
        },
      });

      await this.repository.createDocument(transaction, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language
      });

      return transaction.id;
    } catch (error) {
      throw error;
    }
  }

  async accountTransferTransaction({ accountId, from, to, amount }, Batch) {
    try {
      // const key = process.env.WALLET_BALANCE_KEY
      // const withdrawal_amount = parseFloat(await EncryptionService.decryptData(data['withdrawal_amount'], key));

      const transaction = this.model.cast({
        id: FirebaseHelper.newIdNumber(),
        type: 'accountTransfer',
        amount: amount,
        userID: 'decoopa',
        // userID: accountId,
        payerId: from,
        payeeId: to,
        operation_details: {
          operation: 'decoopa-account',
          id: accountId,
        }
      });

      await this.repository.createDocument(transaction, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language
      });

      return transaction.id;
    } catch (error) {
      throw error;
    }
  }
};