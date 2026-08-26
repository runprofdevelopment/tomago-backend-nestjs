const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Transaction = require('../../database/models/transaction');
const EncryptionService = require('../encryptionService')

module.exports = class WalletTransactionService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Transaction();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async walletWithdrawalTransaction(data, Batch) {
    try {
      const key = process.env.WALLET_BALANCE_KEY
      const withdrawal_amount = parseFloat(await EncryptionService.decryptData(data['withdrawal_amount'], key))
      let transaction_data = {
        id: FirebaseHelper.newIdNumber(),
        amount: withdrawal_amount,
        type: 'confirmedWithdrawal',
        userID: data['userID'],
        payerId: data['userID'],
        payeeId: '1',
        operation_details: {
          operation: 'withdrawal',
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

  async walletVisaRechargeTransaction(data, Batch) {
    try {
      // const key = process.env.WALLET_BALANCE_KEY
      // const withdrawal_amount = parseFloat(await EncryptionService.decryptData(data['withdrawal_amount'], key))
      let transaction_data = {
        id: FirebaseHelper.newIdNumber(),
        type: 'walletRecharge',
        amount: data['recharged_balance'],
        userID: data['userID'],
        payerId: data['userID'],
        payeeId: '1',
        operation_details: {
          operation: 'walletRechargeWithVisa',
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
    } catch (e) {
      throw e
    }
  }

  async walletVoucherRechargeTransaction(data, Batch) {
    try {
      let transaction_data = {
        id: FirebaseHelper.newIdNumber(),
        amount: data['voucher_amount'],
        type: 'walletRecharge',
        payerId: '2',
        userID: data['userID'],
        payeeId: data['userID'],
        operation_details: {
          operation: 'voucherRecharge',
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