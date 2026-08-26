const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Wallet = require('../../database/models/wallet');
const WalletViewer = require('./walletViewer')
const { encryptAllBalances, decryptAllBalances } = require('./walletSecurity')

module.exports = class WalletDeduction {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Wallet(); 2
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async payFullWithWallet(order, Batch) {
    try {
      const wallet = await this.repository.findDocumentById(this.currentUser.id);
      await decryptAllBalances(wallet);
      console.log("gffgfggfggfgf")

      const walletTotalBalance = wallet['voucher_balance'] + wallet['recharged_balance'];
      if (walletTotalBalance < order['totalPrice']) {
        throw new Error(
          `Wallet balance is not enough to pay for the order. Wallet Balance: ${wallet.balance} Order Price: ${order.totalPrice} `,
        );
      }

      if (wallet['recharged_balance'] < order['totalPrice']) {
        const total_price_left = order['totalPrice'] - wallet['recharged_balance'];
        wallet['recharged_balance'] = 0;
        wallet['voucher_balance'] = wallet['voucher_balance'] - total_price_left;
      } else {
        wallet['recharged_balance'] = wallet['recharged_balance'] - order['totalPrice'];
      }

      wallet['balance'] = wallet['balance'] - order['totalPrice'];
      wallet['search'] = wallet['balance'];

      await encryptAllBalances(wallet);
      await this.repository.updateDocument(this.currentUser.id, wallet, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async partialWalletPayment(order, Batch) {
    try {
      const wallet = await this.repository.findDocumentById(this.currentUser.id);
      await decryptAllBalances(wallet);
      if (wallet['balance'] < order['partialAmountPaid']) {
        throw new Error(
          `Wallet balance is not enough to pay for the order. Wallet Balance: ${wallet.balance} Order Price: ${order.totalPrice} `
        )
      }

      if (wallet['recharged_balance'] < order['partialAmountPaid']) {
        const total_price_left = order['partialAmountPaid'] - wallet['recharged_balance'];
        wallet['recharged_balance'] = 0;
        wallet['voucher_balance'] = wallet['voucher_balance'] - total_price_left;
      } else {
        wallet['recharged_balance'] = wallet['recharged_balance'] - order['partialAmountPaid'];
      }
      wallet['balance'] = wallet['balance'] - order['partialAmountPaid'];
      wallet['search'] = wallet['balance'];

      await encryptAllBalances(wallet)
      await this.repository.updateDocument(this.currentUser.id, wallet, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async adminWalletDeduction(data) {
    try {
      const wallet = await this.repository.findDocumentById(data['id'])
      if (wallet === null) {
        throw new Error('Wallet not found')
      }
      await decryptAllBalances(wallet)
      if (wallet['balance'] < data['deduction_amount']) {
        throw new Error(
          `Wallet balance is not enough. Wallet Balance: ${wallet.balance} Withdrawal amount: ${data.deduction_amount} `
        )
      }

      if (wallet['recharged_balance'] < data['deduction_amount']) {
        const total_price_left = data['deduction_amount'] - wallet['recharged_balance'];
        wallet['recharged_balance'] = 0;
        wallet['voucher_balance'] = wallet['voucher_balance'] - total_price_left;
      }
      else {
        wallet['recharged_balance'] = wallet['recharged_balance'] - data['deduction_amount'];
      }
      wallet['balance'] = wallet['balance'] - data['deduction_amount'];
      wallet['search'] = wallet['balance'];

      await encryptAllBalances(wallet)
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(this.currentUser.id, wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      return await new WalletViewer(this).viewWalletById(record.id);
    } catch (error) {
      throw error;
    }
  }
};