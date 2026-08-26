const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Wallet = require('../../database/models/wallet');
const EncryptionService = require('../encryptionService');
const { decryptAllBalances } = require('./walletSecurity')

module.exports = class WalletViewer {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Wallet();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async viewWallet() {
    try {
      const key = process.env.WALLET_BALANCE_KEY
      let wallet = await this.repository.findDocumentById(this.currentUser.id);
      
      // If wallet doesn't exist, create it
      if (!wallet) {
        console.log(`Wallet not found for user ${this.currentUser.id}, creating new wallet`);
        
        const newWallet = {
          id: this.currentUser.id,
          balance: '0',
          voucher_balance: '0',
          recharged_balance: '0',
          currency: 'EGP',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: this.currentUser.id,
          updatedBy: this.currentUser.id
        };
        
        // Create the wallet document
        await this.repository.create(newWallet, {
          currentUser: this.currentUser,
          language: this.language
        });
        
        wallet = newWallet;
        console.log(`Wallet created successfully for user ${this.currentUser.id}`);
      }
      
      // Temporary fix: Check if key exists before decrypting
      if (!key) {
        console.error('WALLET_BALANCE_KEY is not set! Returning unencrypted values.');
        wallet['balance'] = parseFloat(wallet['balance'] || 0)
        wallet['voucher_balance'] = parseFloat(wallet['voucher_balance'] || 0)
        wallet['recharged_balance'] = parseFloat(wallet['recharged_balance'] || 0)
      } else {
        try {
          wallet['balance'] = parseFloat(await EncryptionService.decryptData(wallet['balance'], key))
          wallet['voucher_balance'] = parseFloat(await EncryptionService.decryptData(wallet['voucher_balance'], key))
          wallet['recharged_balance'] = parseFloat(await EncryptionService.decryptData(wallet['recharged_balance'], key))
        } catch (decryptError) {
          console.error('Error decrypting wallet balances, using unencrypted values:', decryptError);
          wallet['balance'] = parseFloat(wallet['balance'] || 0)
          wallet['voucher_balance'] = parseFloat(wallet['voucher_balance'] || 0)
          wallet['recharged_balance'] = parseFloat(wallet['recharged_balance'] || 0)
        }
      }
      
      return wallet
    } catch (error) {
      console.error('Error in viewWallet:', error);
      throw error;
    }
  }

  async viewWalletById(id) {
    try {
      const key = process.env.WALLET_BALANCE_KEY
      let wallet = await this.repository.findDocumentById(id);
      
      // Temporary fix: Check if key exists before decrypting
      if (!key) {
        console.error('WALLET_BALANCE_KEY is not set! Returning unencrypted values.');
        wallet['balance'] = parseFloat(wallet['balance'] || 0)
        wallet['voucher_balance'] = parseFloat(wallet['voucher_balance'] || 0)
        wallet['recharged_balance'] = parseFloat(wallet['recharged_balance'] || 0)
      } else {
        wallet['balance'] = parseFloat(await EncryptionService.decryptData(wallet['balance'], key))
        wallet['voucher_balance'] = parseFloat(await EncryptionService.decryptData(wallet['voucher_balance'], key))
        wallet['recharged_balance'] = parseFloat(await EncryptionService.decryptData(wallet['recharged_balance'], key))
      }
      
      return wallet
    }
    catch (error) {
      throw error;
    }
  }

  async listWallets(args) {
    args['filter'] = args.filter || []
    args['filter'].filter((f) => {
      if (f.field === 'balance') {
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
    record['user'] = await FirebaseHelper.findDocument('user', record.id);
    await decryptAllBalances(record)
    return record;
  }
};