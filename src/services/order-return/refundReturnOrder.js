const config = require('../../../config')();
const admin = require('firebase-admin');
const ReturnRequest = require('../../database/models/returnRequest');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Wallet = require('../../database/models/wallet');
const VoucherEditor = require('../voucher/voucherEditor');
const EncryptionService = require('../encryptionService');
const WalletTransactionService = require('../transaction/walletTransactionService');
const {
  encryptAllBalances,
  decryptAllBalances,
} = require('../wallet/walletSecurity');
const WalletViewer = require('../wallet/walletViewer');
const Order = require('../../database/models/order');
const InventoryService = require('../inventory/inventoryService');

module.exports = class ReturnService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Wallet();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  async refund(data, Batch) {
    try {
      const order = FirebaseHelper.mapDocument(
        await admin
          .firestore()
          .collection('order')
          .doc(data.data['orderID'])
          .get(),
      );

      if (data.data.balance > order.totalPrice) {
        throw new Error(
          'Cannot refund more than the order price',
        );
      }
      if (order === null) {
        throw new Error('Order not found');
      }
      if (order.orderStatus !== 'received') {
        throw new Error(
          'Cannot return an order that was not received',
        );
      }

      if (order.financialStatus !== 'paid') {
        throw new Error(
          'Cannot refund an order that is not paid',
        );
      }

      if (order.financialStatus === 'refunded') {
        throw new Error(
          'Cannot refund an order that is already refunded',
        );
      }

      //////////////////////////////////////////////

      console.log('dataidddd', data.data['id']);

      // Calculate total price of all items in the order
      const totalItemsPrice = order.items.reduce(
        (total, item) => {
          return (
            total + (item.price || 0) * (item.quantity || 1)
          );
        },
        0,
      );

      if (totalItemsPrice < data.data.balance) {
        throw new Error(
          'Cannot refund more than the order price',
        );
      }
      console.log('Total items price:', totalItemsPrice);

      let wallet = await this.repository.findDocumentById(order.userID);
      // Auto-create wallet if missing to avoid refund failures
      if (wallet === null) {
        const WalletCreator = require('../wallet/walletCreator');
        await new WalletCreator(this).createEmptyWallet(order.userID);
        wallet = await this.repository.findDocumentById(order.userID);
      }
      const itemsID = data.data.variantIDs;
      console.log('itemsID', itemsID);
      // Update the status of the refunded items
      order.items = order.items.map((item) => {
        if (itemsID.includes(item.variantId)) {
          // if (item.status == 'refunded') {
          //   throw new Error(
          //     'Cannot refund an item that is already refunded',
          //   );
          // }
          console.log('itemsMap', item);
          // update the status of the refunded items
          return {
            ...item,
            status: data.data.status,
          };
        }
        return item;
      });

      await decryptAllBalances(wallet);
      wallet['balance'] =
        wallet['balance'] + data.data['balance'];
      wallet['voucher_balance'] =
        wallet['voucher_balance'] + data.data['balance'];
      wallet['search'] = wallet['balance'];
      await encryptAllBalances(wallet);

      const requestReturn = FirebaseHelper.mapDocument(
        await admin
          .firestore()
          .collection('returnRequest')
          .doc(data.data['id'])
          .get(),
      );

      requestReturn.items = requestReturn.items.map(
        (item) => {
          if (itemsID.includes(item.variantId)) {
            console.log('itemsMap', item);
            return {
              ...item,
              status: data.data.status,
            };
          }
          return item;
        },
      );

      const batch =
        Batch || (await FirebaseHelper.createBatch());

      batch.update(
        admin
          .firestore()
          .collection('order')
          .doc(data.data['orderID']),
        {
          items: order.items,
        },
      );

      batch.update(
        admin
          .firestore()
          .collection('returnRequest')
          .doc(data.data['id']),
        {
          status: data.data['status'],
        },
      );

      await this.repository.updateDocument(order.userID, wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      // Restore inventory for the returned items
      const inventoryService = new InventoryService(this.ctx);
      await inventoryService.incrementOnOrderCancellation({ items: requestReturn.items }, batch);

      if (!Batch) {
        await FirebaseHelper.commitBatch(batch);
      }

      return await new WalletViewer(this).viewWalletById(
        order.userID,
      );
    } catch (e) {
      throw e;
    }
  }
};
