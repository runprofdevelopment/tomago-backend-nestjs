const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ReturnRequest = require('../../database/models/returnRequest');
const RefundService = require('../order-refund/refundService');
const ReturnTransactionService = require('../transaction/returnTransactionService')

module.exports = class ReturnStatus {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ReturnRequest();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  requestClosed(request) {
    if (request['status'] === 'rejected' || request['status'] === 'confirmed') {
      throw new Error("This request's status is " + request['status'] + " and cannot be changed now")
    }
  }

  async rejectReturnRequest(data) {
    try {
      const request = await this.repository.findDocumentById(data.id);
      if (!request) {
        throw new Error('Cannot find Return Request');
      }
      this.requestClosed(request);
      const status_update = {
        status: 'rejected',
        reason: data.rejectReason
      }
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(data.id, status_update, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(record.id);
    } catch (e) {
      throw e
    }
  }

  async confirmReturnRequest(data) {
    try {
      const batch = await FirebaseHelper.createBatch();
      const request = await this.repository.findDocumentById(data.id);
      let total_refund = 0
      if (!request) {
        throw new Error('Cannot find Return Request');
      }
      if (request['status'] !== 'accepted') {
        throw new Error('Cannot confirm a return request that is not accepted.');
      }
      request['items'].forEach(item => {
        total_refund += item.price * item.quantity // also need taxes amount to refund paid taxes
      });
      const transactionData = {
        id: request.orderID,
        userID: request.userID,
        refundAmount: total_refund,
        type: request.type
      }
      const transactionId = await new ReturnTransactionService(this).refundTransactionService(transactionData, batch)
      await new RefundService(this).refundReturnRequest(request, batch)
      const status_update = {
        status: 'confirmed',
        transactionId
      }

      const record = await this.repository.updateDocument(data.id, status_update, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(record.id);
    }
    catch (e) {
      throw e
    }
  }

  async acceptReturnRequest(data) {
    try {
      const request = await this.repository.findDocumentById(data.id);
      if (!request) {
        throw new Error('Cannot find Return Request');
      }
      this.requestClosed(request);
      const status_update = {
        status: 'accepted',
      }
      console.log('status_update', status_update)
      console.log('request', request)
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(data.id, status_update, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      console.log('record', record)
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(record.id);
    }
    catch (e) {
      throw e
    }
  }
};