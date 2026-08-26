const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const Voucher = require('../../database/models/voucher');
const EncryptionService = require('../encryptionService')

module.exports = class VoucherViewer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Voucher();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async view(id) {
    try {
      const key = process.env.WALLET_BALANCE_KEY
      let voucher = await this.repository.findDocumentById(id);
      voucher['voucher_amount'] = parseFloat(await EncryptionService.decryptData(voucher['voucher_amount'], key))
      return voucher
    }
    catch (error) {
      throw error;
    }
  }

  async listVouchers(args) {
    args['filter'] = args.filter || []
    args['filter'].filter((f) => {
      if (f.field === 'voucher_amount') {
        f.field = 'search';
      }
    });
    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows); // Find Relations
    return response
  }

  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

  async populate(record) {
    if (!record) return record;
    const key = process.env.WALLET_BALANCE_KEY;
    record['voucher_amount'] = parseFloat(await EncryptionService.decryptData(record.voucher_amount, key));
    return record;
  }
};