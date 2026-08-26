const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const OrderEditor = require('./orderEditor');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const Order = require('../../database/models/order');

module.exports = class OrderShipment {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Order();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async orderShippedDecoopa(data) {
    try {
      const order = await this.repository.findDocumentById(data.id);
      if (!order) {
        throw new Error('Order not found');
      }
      if (order.orderStatus !== 'pendingDelivery') {
        throw new Error(`Order status = ${order.orderStatus} and cannot be changed to shipped`);
      }
      if (order.financialStatus === 'pending' && order.paymentMethod === 'visa') {
        throw new Error('Order payment method is visa and is unpaid, cannot ship.');
      }
      // const { shipping_company, tracking_link, tracking_number, status } = data
      const { shipping_company, tracking_link, tracking_number } = data
      
      const shipment_infomation = {
        orderId: data.id,
        shipping_company,
        tracking_link,
        tracking_number,
        status: 'shipped'
      }

      const batch = await FirebaseHelper.createBatch();

      const record = await new FirestoreRepository('shipment').createDocument(shipment_infomation, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      
      await new OrderEditor(this).update({
        id: data.id,
        orderStatus: 'shipped',
        shippingId: record.id,
      }, batch);

      await TimelineEventCreator.execute({
        orderId: order.id,
        event_type: 'orderShipped',
        event_description: `Order was shipped via Decoopa carrier.`,
      }, this.ctx, batch);

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  // orderShippedMaylerz
}