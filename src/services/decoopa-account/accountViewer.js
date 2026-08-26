const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AccountManager = require('./accountManager');
const { COLLECTION_NAME, DEFAULT_ACCOUNT_ID, DECOOPA_ACCOUNT } = require('./model');

module.exports = class AccountViewer {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(COLLECTION_NAME);
  }

  async findDefaultAccount() {
    try {
      let account = await this.repository.findDocumentById(DEFAULT_ACCOUNT_ID);
      
      if (!account) {
        account = await AccountManager.initAccount(this.context);
      }

      return account;
    } catch (error) {
      throw error;
    }
  }

  // async populateAll(records) {
  //   return await Promise.all(
  //     records.map((record) => this.populate(record)),
  //   );
  // }

  // async populate(record) {
  //   if (!record) return record;
  //   record['user'] = await FirebaseHelper.findDocument('user', record.id);
  //   await decryptAllBalances(record)
  //   return record;
  // }
};