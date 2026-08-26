const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ReturnRequest = require('../../database/models/returnRequest');
const WalletTopUp = require('../wallet/walletTopUp');

module.exports = class RefundService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ReturnRequest();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async refundReturnRequest(request, Batch) { // refunds to wallet
    try {
      let total_refund = 0
      if (request['status'] !== 'accepted') {
        throw new Error('Cannot refund a request that is not accepted')
      }
      request['items'].forEach(item => {
        total_refund += item.price * item.quantity // also need taxes amount to refund paid taxes
      });
      await new WalletTopUp(this).adminWalletTopUp({
        balance: total_refund,
        id: request['userID']
      }, Batch);

    }
    catch (e) {
      throw e
    }
  }

};