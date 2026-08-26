const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const WithdrawalRequest = require('../../database/models/withdrawalRequest');
const EncryptionService = require('../encryptionService')

module.exports = class WithdrawalService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new WithdrawalRequest();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async createWithdrawalRequest(data) {
    try {
      const key = process.env.WALLET_BALANCE_KEY;
      const withdrawal_amount = data['withdrawal_amount']
      if (withdrawal_amount <= 50) { // settings admin
        throw new Error('Please enter valid withdrawal amount')
      }
      let wallet = await FirebaseHelper.findDocument('wallet', this.currentUser.id);
      if (!wallet) {
        throw new Error(`The wallet doesn't exist`);
      }

      const recharged_amount = await EncryptionService.decryptData(wallet['recharged_balance'], key)
      if (withdrawal_amount > recharged_amount && recharged_amount !== 0) {
        throw new Error('Withdrawal amount is greater than available balance.')
      }
      data['userID'] = this.currentUser.id
      data = this.model.cast(data)
      data['withdrawal_amount'] = await EncryptionService.encryptData(data['withdrawal_amount'], key)
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      let recharged_remaining = recharged_amount - withdrawal_amount
      recharged_remaining = await EncryptionService.encryptData(recharged_remaining, key)

      let balance = await EncryptionService.decryptData(wallet['balance'], key)
      balance = balance - withdrawal_amount
      const search = balance
      balance = await EncryptionService.encryptData(balance, key)

      const updated_wallet = {
        recharged_balance: recharged_remaining,
        balance,
        search
      }
      await new FirestoreRepository('wallet').updateDocument(this.currentUser.id, updated_wallet, {
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

  async viewMyWithdrawalRequests() {
    const requests = FirebaseHelper.mapCollection(
      await admin.firestore().collection(this.collectionName)
        .where('userID', '==', this.currentUser.id)
        .get()
    )
    const key = process.env.WALLET_BALANCE_KEY
    for (let request of requests) {
      request['withdrawal_amount'] = await EncryptionService.decryptData(request['withdrawal_amount'], key)
    }
    return requests
  }


  async listWithdrawalRequests(args) {
    args['filter'] = args.filter || []
    // args['filter'].push({ field: 'accountType', operator: 'in', value: ['admin', 'owner'] });
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

    record['user'] = await FirebaseHelper.findDocument('user', record.userID);
    record['withdrawal_amount'] = await EncryptionService.decryptData(record['withdrawal_amount'], key)

    return record;
  }
};