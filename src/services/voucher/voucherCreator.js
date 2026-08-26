const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Voucher = require('../../database/models/voucher');
const EncryptionService = require('../encryptionService')


module.exports = class VoucherCreator {
  constructor({ currentUser, language }) {
    this.language = language;
    this.currentUser = currentUser;
    this.model = new Voucher();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }


  async _preSave(data) {
    data = this.model.cast(data);
    return data;
  }

  async create(data) {
    try {
      if (!data['userID']) {
        data['userID'] = null
      }
      const key = process.env.WALLET_BALANCE_KEY
      const voucher_exists = await this.repository.findDocumentById(data['voucher_code']);
      if (voucher_exists !== null) {
        throw new Error(`Voucher with code ${data.voucher_code} already exists!!`);
      }
      if (data['voucher_type'] === 'SALE' && data['voucher_amount_type'] === 'percent'
        && (data['voucher_amount'] > 100 || data['voucher_amount'] <= 0)) {
        throw new Error('Voucher of type sale must have % between 1 and 100')
      }
      if (data['voucher_type'] === 'SALE' && data['voucher_amount_type'] === 'fixed'
        && data['voucher_amount'] <= 0) {
        throw new Error('Voucher of type SALE and fixed must have value more than 0');
      }
      if (data['voucher_type'] === 'BALANCE' && data['voucher_amount'] <= 0) {
        throw new Error('Voucher of type balance must have value more than 0');
      }
      if (data['voucher_type'] === 'BALANCE' && data['voucher_amount_type'] === 'percent') {
        throw new Error('Voucher of type balance must have amount type fixed not percent!');
      }
      data['id'] = data['voucher_code']
      data['usage'] = {}
      data['search'] = data['voucher_amount']
      data['voucher_amount'] = await EncryptionService.encryptData(data['voucher_amount'], key)
      data['total_uses'] = 0
      data = this.model.cast(data);
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      await FirebaseHelper.commitBatch(batch)
      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }
}