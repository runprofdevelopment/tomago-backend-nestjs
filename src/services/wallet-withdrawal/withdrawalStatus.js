const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const WithdrawalRequest = require('../../database/models/withdrawalRequest');
const EncryptionService = require('../encryptionService')
const WalletTransactionService = require('../transaction/walletTransactionService')



module.exports = class WithdrawalStatus {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new WithdrawalRequest();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  requestClosed(request) {
    if (request['status'] === 'rejected' || request['status'] === 'confirmed') {
      throw new Error("This request's status is " + request['status'] + " and cannot be changed now")
    }
  }

  async rejectWithdrawal(data) {
    try {
      const request = await this.repository.findDocumentById(data.id)
      if (!request) {
        throw new Error('Cannot find Withdrawal Request')
      }
      this.requestClosed(request)
      const wallet = FirebaseHelper.mapDocument(await admin.firestore().collection('wallet').doc(request['userID']).get())
      const key = process.env.WALLET_BALANCE_KEY
      const refund_amount = parseFloat(await EncryptionService.decryptData(request['withdrawal_amount'], key))
      const status_update = {
        status: 'rejected',
        reason: data.reason
      }
      const total_balance = parseFloat(await EncryptionService.decryptData(wallet['balance'], key))
      const recharged_balance = parseFloat(await EncryptionService.decryptData(wallet['recharged_balance'], key))
      let updated_recharged = recharged_balance + refund_amount
      let updated_total = total_balance + refund_amount
      let search = updated_total
      updated_recharged = await EncryptionService.encryptData(updated_recharged, key)
      updated_total = await EncryptionService.encryptData(updated_total, key)
      const wallet_update = {
        recharged_balance: updated_recharged,
        balance: updated_total,
        search
      }
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(data.id, status_update, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await new FirestoreRepository('wallet').updateDocument(request['userID'], wallet_update, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch)
      return this.repository.findDocumentById(record.id)
    }
    catch (e) {
      throw e
    }
  }

  async confirmWithdrawal(data) {
    try {
      const batch = await FirebaseHelper.createBatch();
      const request = await this.repository.findDocumentById(data.id)
      if (!request) {
        throw new Error('Cannot find Withdrawal Request')
      }
      if (request['status'] !== 'accepted') {
        throw new Error('Cannot confirm a withdrawal request that is not accepted.')
      }
      const transactionId = await new WalletTransactionService(this).walletWithdrawalTransaction(request, batch)
      const status_update = {
        status: 'confirmed',
        referenceId: data.referenceId,
        note: data.note,
        transactionId,
      }
      const record = await this.repository.updateDocument(data.id, status_update, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch)
      return this.repository.findDocumentById(record.id)
    }
    catch (e) {
      throw e
    }
  }

  async acceptWithdrawal(data) {
    try {
      const request = await this.repository.findDocumentById(data.id)
      if (!request) {
        throw new Error('Cannot find Withdrawal Request')
      }
      this.requestClosed(request)
      const status_update = {
        status: 'accepted',
      }
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(data.id, status_update, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch)
      return this.repository.findDocumentById(record.id)
    }
    catch (e) {
      throw e
    }
  }
};