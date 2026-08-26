const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Wallet = require('../../database/models/wallet');
const VoucherEditor = require('../voucher/voucherEditor')
const EncryptionService = require('../encryptionService')
const WalletTransactionService = require('../transaction/walletTransactionService')
const { encryptAllBalances, decryptAllBalances } = require('./walletSecurity');
const WalletViewer = require('./walletViewer');

module.exports = class WalletTopUp {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Wallet();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }
  
  async initiateWalletRecharge(_walletId, _amount, _currency) {
    throw new Error(
      'Card wallet recharge is disabled. Use voucher top-up or admin wallet credit.',
    );
  }

  async addBalanceCard(data) {
    try {
      let id = data['id']
      if (!id) {
        id = this.currentUser.id
      }
      const recharged_balance = data['recharged_balance'];

      const wallet = await this.repository.findDocumentById(id);
      await decryptAllBalances(wallet)
      wallet['recharged_balance'] = recharged_balance + wallet['recharged_balance']
      wallet['balance'] = wallet['voucher_balance'] + wallet['recharged_balance']
      wallet['search'] = wallet['balance']
      await encryptAllBalances(wallet);

      const batch = await FirebaseHelper.createBatch();

      await new WalletTransactionService(this).walletVisaRechargeTransaction({
        id: id,
        userID: id,
        recharged_balance,
      }, batch)

      await this.repository.updateDocument(id, wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      // return await new WalletViewer(this).viewWallet();
    } catch (error) {
      throw error;
    }
  }
  
  async addBalanceVoucher(data) {
    try {
      let id = data['id']
      if (!id) {
        id = this.currentUser.id
      }
      const key = process.env.WALLET_BALANCE_KEY
      const voucher = await new FirestoreRepository('voucher').findDocumentById(data['voucher_code'])
      if (voucher === null) {
        throw new Error('Voucher not found!')
      }
      const available = await new VoucherEditor(this).checkUsageAvailability(voucher, id, 'BALANCE')
      if (!available) {
        return new Error('Cannot use voucher')
      }
      let wallet = await this.repository.findDocumentById(id);
      let voucher_amount = parseFloat(await EncryptionService.decryptData(voucher['voucher_amount'], key))
      await decryptAllBalances(wallet)
      wallet['voucher_balance'] = voucher_amount + wallet['voucher_balance']
      wallet['balance'] = wallet['voucher_balance'] + wallet['recharged_balance']
      wallet['search'] = wallet['balance']
      await encryptAllBalances(wallet)
      const batch = await FirebaseHelper.createBatch();
      await new WalletTransactionService(this).walletVoucherRechargeTransaction({
        voucher_amount,
        userID: id,
        id: voucher['voucher_code'],
      }, batch)
      await this.repository.updateDocument(id, wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await new VoucherEditor(this).updateVoucherAfterUsed(voucher['id'], id, batch)
      await FirebaseHelper.commitBatch(batch);
      return await new WalletViewer(this).viewWalletById(id);
    }
    catch (e) {
      throw e
    }
  }

  async adminWalletTopUp(data, Batch) {
    try {
      let wallet = await this.repository.findDocumentById(data['id']);
      // Auto-create wallet if missing
      if (wallet === null) {
        const WalletCreator = require('./walletCreator');
        await new WalletCreator(this).createEmptyWallet(data['id']);
        wallet = await this.repository.findDocumentById(data['id']);
      }
      await decryptAllBalances(wallet);
      wallet['balance'] = wallet['balance'] + data['balance'];
      wallet['voucher_balance'] = wallet['voucher_balance'] + data['balance'];
      wallet['search'] = wallet['balance'];
      await encryptAllBalances(wallet);
      const batch = Batch || await FirebaseHelper.createBatch();
      await this.repository.updateDocument(data['id'], wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      if (!Batch) {
        await FirebaseHelper.commitBatch(batch);
      }
      return await new WalletViewer(this).viewWalletById(data['id']);
    }
    catch (e) {
      throw e;
    }
  }
};