const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const OrderTransactionService = require('../transaction/orderTransatctionService');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const OrderEditor = require('./orderEditor');
const Order = require('../../database/models/order');

module.exports = class OrderStatus {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Order();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async orderPendingDelivery(id) {
    try {
      const order = await this.repository.findDocumentById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.orderStatus !== 'pendingAcceptance') {
        throw new Error(`Order status = ${order.orderStatus} and cannot be changed to pending delivery`)
      }

      const batch = await FirebaseHelper.createBatch();

      await new OrderEditor(this).update({
        id,
        orderStatus: 'pendingDelivery',
      }, batch);

      await TimelineEventCreator.execute({
        orderId: id,
        event_type: 'orderConfirmed',
        event_description: 'Order was confirmed by the system.',
      }, this.ctx, batch);

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async orderReceivedVisa(id) { // or wallet
    try {
      const order = await this.repository.findDocumentById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.orderStatus !== 'shipped') {
        const error = 'Order status = ' + order.orderStatus + ' and cannot be changed to received';
        throw new Error(error);
      }
      if (order.paymentMethod === 'cod') {
        const error = 'Order payment method = COD, cannot use this endpoint for receiving order.';
        throw new Error(error);
      }

      const batch = await FirebaseHelper.createBatch();

      await new OrderEditor(this).update({
        id,
        orderStatus: 'received',
      }, batch);

      await TimelineEventCreator.execute({
        orderId: id,
        event_type: 'orderReceived',
        event_description: 'Order was received',
      }, this.ctx, batch);

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async orderReceivedCOD(id) {
    try {
      let order = await this.repository.findDocumentById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.financialStatus === 'paid' || order.paymentMethod !== 'cod' || order.orderStatus !== 'shipped') {
        throw new Error('Cannot set order as paid or received');
      }
      
      const batch = await FirebaseHelper.createBatch();
      
      const transactionId = await new OrderTransactionService(this).createOrderTransaction(order, batch);

      order = await new OrderEditor(this).update({
        id: id,
        orderStatus: 'received',
        financialStatus: 'paid',
        transactionId,
      }, batch);

      await TimelineEventCreator.execute({
        orderId: id,
        event_type: 'orderReceived',
        event_description: 'The order has been received and the amount has been collected.',
      }, this.ctx, batch);

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }
}