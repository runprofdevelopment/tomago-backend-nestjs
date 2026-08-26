const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AccountManager = require('./accountManager');
const AccountTransactionService = require('../transaction/accountTransactionService');
const { COLLECTION_NAME, DEFAULT_ACCOUNT_ID, DECOOPA_ACCOUNT } = require('./model');

module.exports = class AccountDebitService {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(COLLECTION_NAME);
  }

  async deductFunds(amount, note) {
    try {
      const data = await this._preSave(amount);

      const batch = await FirebaseHelper.createBatch();
      
      await this.repository.updateDocument(DEFAULT_ACCOUNT_ID, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      await new AccountTransactionService(this.context).accountDebitTransaction({
        accountId: DEFAULT_ACCOUNT_ID, 
        amount: amount,
        note,
      }, batch);

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async _preSave(amount) {
    if (amount <= 0) throw new Error(`The amount specified must be greater than zero. Please enter a valid amount to proceed with the recharge.`);

    let account = await this.repository.findDocumentById(DEFAULT_ACCOUNT_ID);
    if (!account) {
      account = await AccountManager.initAccount(this.context);
    }


    if (account.balance < amount) {
      throw new Error(
        `The account balance is not enough to debit. Account Balance: ${account.balance}. Debit Amount: ${amount}`
      )
    }

    const data = {
      balance: account.balance - amount,
    };

    return data;
  }
};