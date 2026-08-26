const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const WalletSecurity = require('../wallet/walletSecurity');
const OrderEditor = require('./orderEditor');
const OrderTransactionService = require('../transaction/orderTransatctionService');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const OrderViewer = require('./orderViewer');
const Order = require('../../database/models/order');
const ar = require('../../i18n/ar');
const InventoryService = require('../inventory/inventoryService');

module.exports = class OrderCancel {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Order();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  async userCancelOrder(args) {
    try {
      let order = await this.repository.findDocumentById(
        args.id,
      );

      // Extract item IDs from the order
      const itemsID = args.itemsID;

      if (!order) {
        throw new Error('Order not found');
      }
      if (
        order.orderStatus === 'shipped' ||
        order.orderStatus === 'received' ||
        order.orderStatus === 'cancelled'
      ) {
        throw new Error(
          `Order status = ${order.orderStatus}, so order cannot be cancelled now.`,
        );
      }
      if (order.userID !== this.currentUser.id) {
        throw new Error(
          'Cannot cancel order that does not belong to this user',
        );
      }

      if (order.financialStatus === 'paid') {
        if (order.paymentMethod === 'visa') {
          return await this.cancelOrderVisa(order, itemsID);
        } else if (order.paymentMethod === 'wallet') {
          return await this.cancelItemsinOrderWallet(
            order,
            itemsID,
          );
        }
      }

      if (
        (order.financialStatus === 'unpaid' ||
          order.financialStatus === 'pending') &&
        (order.paymentMethod === 'cod' ||
          order.paymentMethod === 'visa')
      ) {
        return await this._executeCancel(order, itemsID);
      }
      if (
        (order.financialStatus === 'partialPaid' ||
          order.financialStatus ===
            'waitingPaymentConfirmation') &&
        order.paymentMethod === 'credit'
      ) {
        return await this.cancelItemsinOrderWallet(
          order,
          itemsID,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async adminCancelOrder(args) {
    try {
      let order = await this.repository.findDocumentById(
        args.id,
      );

      // Extract item IDs from the order
      const itemsID = args.itemsID;

      if (!order) {
        throw new Error('Order not found');
      }
      if (
        order.orderStatus === 'shipped' ||
        order.orderStatus === 'received' ||
        order.orderStatus === 'cancelled'
      ) {
        throw new Error(
          `Order status = ${order.orderStatus}, so order cannot be cancelled now.`,
        );
      }

      order.cancelReason = args.cancelReason;

      if (order.financialStatus === 'paid') {
        if (order.paymentMethod === 'visa') {
          return await this.cancelOrderVisa(order, itemsID);
        } else if (order.paymentMethod === 'wallet') {
          return await this.cancelItemsinOrderWallet(
            order,
            itemsID,
          );
        }
      }

      if (
        (order.financialStatus === 'unpaid' ||
          order.financialStatus === 'pending') &&
        (order.paymentMethod === 'cod' ||
          order.paymentMethod === 'visa')
      ) {
        return await this._executeCancel(order, itemsID, {
          cancelReason: order.cancelReason,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async cancelOrderWallet(order) {
    try {
      const userID = order.userID;
      let wallet = await FirebaseHelper.findDocument(
        'wallet',
        userID,
      );
      await WalletSecurity.decryptAllBalances(wallet);

      wallet['voucher_balance'] =
        wallet['voucher_balance'] + order['totalPrice'];
      wallet['balance'] =
        wallet['balance'] + order['totalPrice'];
      wallet['search'] = wallet['balance'];

      await WalletSecurity.encryptAllBalances(wallet);

      const batch = await FirebaseHelper.createBatch();

      const transactionId =
        await new OrderTransactionService(
          this,
        ).refundOrderTransaction(order, batch);
      await new FirestoreRepository(
        'wallet',
      ).updateDocument(userID, wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      return await this._executeCancel(
        order,
        {
          financialStatus: 'refunded',
          transactionId,
          cancelReason: order.cancelReason,
        },
        batch,
      );
    } catch (error) {
      throw error;
    }
  }

  async cancelItemsinOrderWallet(order, itemsID = null) {
    try {
      const userID = order.userID;
      let wallet = await FirebaseHelper.findDocument(
        'wallet',
        userID,
      );
      await WalletSecurity.decryptAllBalances(wallet);

      if (itemsID) {
        // Cancel specific items by their IDs
        console.log(itemsID);
        const itemsToCancel = order.items.filter((item) =>
          itemsID.includes(item.variantId),
        );
        const totalRefund = itemsToCancel.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        // Calculate total quantity to subtract
        const totalQuantityToSubtract =
          itemsToCancel.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

        // Update the status of the canceled items
        order.items = order.items.map((item) => {
          if (itemsID.includes(item.variantId)) {
            return { ...item, status: 'Canceled' }; // Update status to "Canceled"
          }
          return item;
        });

        // Update totalQuantity
        order.totalQuantity =
          (order.totalQuantity || 0) -
          totalQuantityToSubtract;

        console.log('totalRefund = ', totalRefund);

        wallet['voucher_balance'] += totalRefund;
        wallet['balance'] += totalRefund;
        wallet['search'] = wallet['balance'];

        // Check if all items in the order are canceled
        const allItemsCanceled = order.items.every(
          (item) => item.status === 'Canceled',
        );
        if (allItemsCanceled) {
          order.orderStatus = 'cancelled'; // Update order status to "Canceled"
        }

        // Update isCanceled to true if some items are canceled
        order.isCanceled = true;

        // Update the items in the order
        // order.items = order.items.map((item) => ({
        //   ...item,
        //   status: 'Canceled',
        // }));

        await new FirestoreRepository(
          'order',
        ).updateDocument(order.id, order, {
          currentUser: this.currentUser,
          language: this.language,
        });
      } else {
        // Cancel the entire order
        wallet['voucher_balance'] += order['totalPrice'];
        wallet['balance'] += order['totalPrice'];
        wallet['search'] = wallet['balance'];
      }

      await WalletSecurity.encryptAllBalances(wallet);

      const batch = await FirebaseHelper.createBatch();

      const transactionId =
        await new OrderTransactionService(
          this,
        ).refundOrderTransaction(order, batch, itemsID);
      await new FirestoreRepository(
        'wallet',
      ).updateDocument(userID, wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      return await this._executeCancel(
        order,
        itemsID,
        {
          financialStatus: 'refunded',
          transactionId,
          cancelReason: order.cancelReason,
          itemsID, // Include itemsID in cancellation metadata
        },
        batch,
      );
    } catch (error) {
      throw error;
    }
  }

  // async cancelItemsinOrderWallet(
  //   order,
  //   items,
  //   itemQuantity,
  // ) {
  //   try {
  //     const userID = order.userID;
  //     let wallet = await FirebaseHelper.findDocument(
  //       'wallet',
  //       userID,
  //     );
  //     await WalletSecurity.decryptAllBalances(wallet);

  //     // Calculate total price based on items and itemQuantity
  //     let totalPrice = 0;
  //     for (let i = 0; i < items.length; i++) {
  //       totalPrice += items[i].price * itemQuantity[i];
  //     }

  //     // Update wallet balances
  //     wallet['voucher_balance'] += totalPrice;
  //     wallet['balance'] += totalPrice;
  //     wallet['search'] = wallet['balance'];

  //     await WalletSecurity.encryptAllBalances(wallet);

  //     const batch = await FirebaseHelper.createBatch();

  //     // Process refund transaction
  //     const transactionId =
  //       await new OrderTransactionService(
  //         this,
  //       ).refundOrderTransaction(order, batch);
  //     await new FirestoreRepository(
  //       'wallet',
  //     ).updateDocument(userID, wallet, {
  //       batch,
  //       currentUser: this.currentUser,
  //       language: this.language,
  //     });

  //     return await this._executeCancel(
  //       order,
  //       {
  //         financialStatus: 'refunded',
  //         transactionId,
  //         cancelReason: order.cancelReason,
  //       },
  //       batch,
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async cancelOrderVisa(order, itemsID = null) {
    const userID = order.userID;
    let wallet = await FirebaseHelper.findDocument(
      'wallet',
      userID,
    );
    await WalletSecurity.decryptAllBalances(wallet);

    if (itemsID) {
      // Cancel specific items by their IDs
      console.log(itemsID);
      const itemsToCancel = order.items.filter((item) =>
        itemsID.includes(item.variantId),
      );
      const totalRefund = itemsToCancel.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Calculate total quantity to subtract
      const totalQuantityToSubtract = itemsToCancel.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      order.items = order.items.map((item) => {
        if (itemsID.includes(item.variantId)) {
          return { ...item, status: 'Canceled' };
        }
        return item;
      });

      // Update totalQuantity
      order.totalQuantity =
        (order.totalQuantity || 0) -
        totalQuantityToSubtract;

      console.log('totalRefund = ', totalRefund);

      wallet['voucher_balance'] += totalRefund;
      wallet['balance'] += totalRefund;
      wallet['search'] = wallet['balance'];
      // Check if all items in the order are canceled
      const allItemsCanceled = order.items.every(
        (item) => item.status === 'Canceled',
      );
      if (allItemsCanceled) {
        order.orderStatus = 'cancelled'; // Update order status to "Canceled"
      }

      // Update isCanceled to true if some items are canceled
      order.isCanceled = true;

      await new FirestoreRepository('order').updateDocument(
        order.id,
        order,
        {
          currentUser: this.currentUser,
          language: this.language,
        },
      );
    } else {
      // Cancel the entire order
      wallet['voucher_balance'] += order['totalPrice'];
      wallet['balance'] += order['totalPrice'];
      wallet['search'] = wallet['balance'];
    }
    return await this._executeCancel(order, itemsID, {
      financialStatus: 'pendingRefund',
      cancelReason: order.cancelReason,
      // transactionId,
    });
  }

  async cancelOrderPendingPayment(orderId) {
    try {
      console.log("start cancelOrderPendingPayment");
      const order = await this.repository.findDocumentById(
        orderId,
      );

      const isPaymentGatewayMethod = [
        'credit',
        'installment',
        'e_wallet',
      ].includes(order.paymentMethod);

      if (
        isPaymentGatewayMethod &&
        order.financialStatus !== 'paid'
      ) {
        const batch = await FirebaseHelper.createBatch();

        const orderData = {
          isCanceled: true,
          orderStatus: 'cancelled',
          cancelReason: `Order canceled due to payment timeout. The payment gateway did not confirm the transaction within the allowed timeframe.`,
        };

        console.log("Order data: ", orderData);

        // Refund partial amount paid from wallet
        if (
          order.useWallet &&
          order.partialAmountPaid > 0
        ) {
          const transactionId =
            await this.refundAmountToWallet(
              order,
              order.partialAmountPaid,
              batch,
            );
          const transactionIds = order.transactionIds || [];
          transactionIds.push(transactionId);
          orderData['transactionIds'] = transactionIds;
          orderData['financialStatus'] = 'partialPaid';
          orderData['isReturned'] = true;
        } else {
          orderData['financialStatus'] = 'unpaid';
        }

        console.log('Order data2: ', orderData);

        await new FirestoreRepository(
          'order',
        ).updateDocument(order.id, orderData, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });

        await FirebaseHelper.commitBatch(batch);

        // Restore inventory for orders canceled due to payment timeout
        try {
          const inventoryService = new InventoryService(this.ctx);
          const inventoryBatch = await FirebaseHelper.createBatch();
          await inventoryService.incrementOnOrderCancellation(order, inventoryBatch);
          await FirebaseHelper.commitBatch(inventoryBatch);
        } catch (invErr) {
          console.error('Failed to restore inventory on payment-timeout cancel:', invErr);
        }

        await TimelineEventCreator.execute(
          {
            orderId: order.id,
            event_type: 'orderCancelled',
            event_description: `Order was cancelled by system. The payment gateway did not confirm the transaction within the allowed timeframe.`,
          },
          this.ctx,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async refundAmountToWallet(order, amount, batch) {
    try {
      const userID = order.userID;
      let wallet = await FirebaseHelper.findDocument(
        'wallet',
        userID,
      );

      await WalletSecurity.decryptAllBalances(wallet);
      wallet['voucher_balance'] += amount;
      wallet['balance'] += amount;
      wallet['search'] = wallet['balance'];
      await WalletSecurity.encryptAllBalances(wallet);

      const transactionId =
        await new OrderTransactionService(
          this.ctx,
        ).refundOrderTransaction(
          {
            ...order,
            totalPrice: amount,
            paymentMethod: `wallet`,
          },
          batch,
        );

      await new FirestoreRepository(
        'wallet',
      ).updateDocument(userID, wallet, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      return transactionId;
    } catch (error) {
      throw error;
    }
  }

  async _executeCancel(order, itemsID, data, Batch) {
    const batch =
      Batch || (await FirebaseHelper.createBatch());
    const cancelledBy =
      order.userID === this.currentUser.id
        ? 'user'
        : 'admin';

    const userID = order.userID;
    let wallet = await FirebaseHelper.findDocument(
      'wallet',
      userID,
    );
    await WalletSecurity.decryptAllBalances(wallet);

    if (itemsID) {
      // Cancel specific items by their IDs
      console.log(itemsID);
      const itemsToCancel = order.items.filter((item) =>
        itemsID.includes(item.variantId),
      );
      const totalRefund = itemsToCancel.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Calculate total quantity to subtract
      const totalQuantityToSubtract = itemsToCancel.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      order.items = order.items.map((item) => {
        if (itemsID.includes(item.variantId)) {
          return { ...item, status: 'Canceled' };
        }
        return item;
      });

      // Update totalQuantity
      order.totalQuantity =
        (order.totalQuantity || 0) -
        totalQuantityToSubtract;

      console.log('totalRefund = ', totalRefund);
      if (order.paymentMethod === 'visa') {
        wallet['voucher_balance'] += totalRefund;
        wallet['balance'] += totalRefund;
        wallet['search'] = wallet['balance'];
      }
      // Check if all items in the order are canceled
      const allItemsCanceled = order.items.every(
        (item) => item.status === 'Canceled',
      );
      if (allItemsCanceled) {
        order.orderStatus = 'cancelled'; // Update order status to "Canceled"
      }

      // Update isCanceled to true if some items are canceled
      order.isCanceled = true;

      await new FirestoreRepository('order').updateDocument(
        order.id,
        order,
        {
          currentUser: this.currentUser,
          language: this.language,
        },
      );
    } else {
      // Cancel the entire order
      wallet['voucher_balance'] += order['totalPrice'];
      wallet['balance'] += order['totalPrice'];
      wallet['search'] = wallet['balance'];
    }
    //////////////////////////////////////////////////////////////////////////////
    await new OrderEditor(this.ctx).update(
      {
        id: order.id,
        // orderStatus: 'cancelled',
        ...data,
      },
      batch,
    );

    await TimelineEventCreator.execute(
      {
        orderId: order.id,
        event_type: 'orderCancelled',
        event_description: `Order was cancelled by the ${cancelledBy}.`,
      },
      this.ctx,
      batch,
    );

    await FirebaseHelper.commitBatch(batch);

    // Restore inventory for the canceled order
    const inventoryService = new InventoryService(this.ctx);
    const inventoryBatch = await FirebaseHelper.createBatch();
    await inventoryService.incrementOnOrderCancellation(order, inventoryBatch);
    await FirebaseHelper.commitBatch(inventoryBatch);

    // return await this.repository.findDocumentById(order.id);
    return await new OrderViewer(this.ctx).findById(
      order.id,
    );
  }
};
