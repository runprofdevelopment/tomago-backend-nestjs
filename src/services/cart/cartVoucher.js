const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const Cart = require('../../database/models/cart');
const VoucherEditor = require('../voucher/voucherEditor');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const CartViewer = require('./cartViewer')


module.exports = class CartVoucher {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Cart();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async applyVoucherToCart(id) {
    try {
      const voucher = await new FirestoreRepository('voucher').findDocumentById(id);
      if (voucher === null) {
        throw new Error('Voucher not found!');
      }
      const available = await new VoucherEditor(this).checkUsageAvailability(voucher, this.currentUser.id, 'SALE')
      if (!available) {
        throw new Error('Cannot use voucher');
      }
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(this.currentUser.id, { voucherId: id }, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      // await new VoucherEditor(this).updateVoucherAfterUsed(voucher, this.currentUser.id, batch);
      // after order placement
      await FirebaseHelper.commitBatch(batch);
      return await new CartViewer(this).viewCartCheckout();
    }
    catch (e) {
      throw e
    }
  }

  async setVoucherIdNull() {
    try {
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(this.currentUser.id, { voucherId: null }, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      return true
    }
    catch (e) {
      throw e
    }
  }

}