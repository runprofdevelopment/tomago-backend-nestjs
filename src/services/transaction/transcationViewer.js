const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Transaction = require('../../database/models/transaction');

module.exports = class TransactionViewer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Transaction();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  // const TRANSACTION_TYPE = [
  //   'walletPayment', 'visaPayment', 'codPayment',
  //   'voucherRecharge', 'visaRecharge', 'confirmedWithdrawal',
  //   'walletRefund', 'returnItems'
  // ]

  async viewMyWalletTransactions() {
    const transactions = FirebaseHelper.mapCollection(
      await admin.firestore().collection(`transaction`)
        .where('type', 'in', ['walletRecharge', 'walletPayment', 'confirmedWithdrawal'])
        .where('userID', '==', this.currentUser.id)
        .orderBy('createdAt', 'desc')
        .get()
    );

    if (transactions.length > 0) {
      return transactions;
    }
    return [];
  }

  async viewTransactionById(id) {
    return await this.repository.findDocumentById(id)
  }

  async listMyTransactions(args) {
    args['filter'] = args.filter || [];
    args.filter.push({ field: 'userID', operator: 'equal', value: this.currentUser.id });

    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows);
    return response
  }

  async listTransactions(args) {
    args['filter'] = args.filter || [];
    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows);
    return response
  }

  async listDecoopaAccountTransactions(args) {
    args['filter'] = args.filter || [];
    args['filter'].push({ field: 'userID', operator: 'equal', value: 'decoopa' });

    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows);
    return response
  }

  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

  async populate(record) {
    if (!record) return record
    // any additions I want to do

    record['payer'] = await FirebaseHelper.findRelation('user', record.payerId);
    record['payee'] = await FirebaseHelper.findRelation('user', record.payeeId);

    return record
  }
};