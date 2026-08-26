const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const Voucher = require('../../database/models/voucher');
const admin = require('firebase-admin');

module.exports = class VoucherEditor {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Voucher();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async updateVoucherAfterUsed(id, userID, Batch) {
    try {
      const voucher = await this.repository.findDocumentById(id);
      let found = 0
      let updated_data = voucher
      let users = updated_data['usage']
      if (!users[userID]) {
        users[userID] = 1
      }
      else {
        users[userID]++
        found = 1
      }
      updated_data['total_uses']++
      const record = await this.repository.updateDocument(voucher.id, updated_data, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }



  async checkUsageAvailability(voucher, userID, type) { // check availability now type
    if (voucher['voucher_type'] !== type) {
      throw new Error('Voucher type is not valid for this operation')
    }
    const current_date = new Date()
    if (voucher['startDate'] > current_date) {
      throw new Error('Voucher has not yet been activated.')
    }
    if (voucher['endDate'] < current_date) {
      throw new Error('Expired voucher')
    }
    const users = voucher['usage']
    if (Object.keys(users).length === 0) {
      return true
    }
    if (!users[userID]) {
      if (Object.keys(users).length === voucher['user_count']) {
        throw new Error('Voucher maximum number of users reached.')
      }
      return true
    }
    else {
      if (users[userID] < voucher['use_per_user']) {
        return true
      }
      else {
        throw new Error('User has used the Voucher maximum times.')
      }
    }
  }

  async deleteVoucher(id) {
    try {
      await admin.firestore().collection(this.collectionName).doc(id).delete()
      return true
    }
    catch (e) {
      throw e
    }
  }

};