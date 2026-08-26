const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Wallet = require('../../database/models/wallet');
const WalletTopUp = require('./walletTopUp');
const WalletViewer = require('./walletViewer');
const EncryptionService = require('../encryptionService');

module.exports = class WalletCreator {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Wallet();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async createEmptyWallet(userID) {
    try {
      const data = {
        id: userID || this.currentUser.id,
        ...this.model.cast({})
      }
      const key = process.env.WALLET_BALANCE_KEY;
      data['balance'] = await EncryptionService.encryptData(0, key);
      data['voucher_balance'] = await EncryptionService.encryptData(0, key);
      data['recharged_balance'] = await EncryptionService.encryptData(0, key);
      data['currency'] = 'EGP';

      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch);

      // return await this.repository.findDocumentById(record.id);
      return await new WalletViewer(this.ctx).viewWalletById(record.id);
    }
    catch (error) {
      throw error
    }
  }
};