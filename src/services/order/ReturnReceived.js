const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const OrderEditor = require('./orderEditor');
const RequestReturnEditor = require('./requestReturnEditor');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const Order = require('../../database/models/returnRequest');

module.exports = class ReturnReceived {
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

  async returnReceivedStauts(data) {
    try {
      const returnRequest =
        await this.repository.findDocumentById(data.id);
      if (!returnRequest) {
        throw new Error('Order not found');
      }
      if (
        returnRequest.status !== 'returnedDeleveryOnTheWay'
      ) {
        throw new Error(
          `Order status = ${returnRequest.status} and cannot be changed to returnedDeleveryOnTheWay`,
        );
      }

      // const { shipping_company, tracking_link, tracking_number, status } = data
   
      const {
        shipping_company,
        tracking_link,
        tracking_number,
      } = data;

      const shipment_infomation = {
        orderId: data.id,
        shipping_company,
        tracking_link,
        tracking_number,
        status: 'returnRequest',
      };

      const batch = await FirebaseHelper.createBatch();

      await new RequestReturnEditor(this).update(
        {
          id: data.id,
          status: 'returnReceivedAndUnderReview',
        },
        batch,
      );
      ////////////////////////////////////.  get order and update status of items ////////////////////////////////////////

      const order = FirebaseHelper.mapDocument(
        await admin
          .firestore()
          .collection('order')
          .doc(returnRequest.orderID)
          .get(),
      );

      const itemsID = returnRequest['items'].map(
        (item) => item.variantId,
      );
      order.items = order.items.map((item) => {
        if (itemsID.includes(item.variantId)) {
          return {
            ...item,
            status: 'returnReceivedAndUnderReview',
          };
        }
        return item;
      });

      batch.update(
        admin
          .firestore()
          .collection('order')
          .doc(returnRequest['orderID']),
        {
          items: order.items,
        },
      );

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      // await new OrderEditor(this).update(
      //   {
      //     id: data.orderID,
      //     orderStatus: 'shipped',
      //     shippingId: record.id,
      //   },
      //   batch,
      // );

      // await TimelineEventCreator.execute(
      //   {
      //     orderId: order.id,
      //     event_type: 'orderShipped',
      //     event_description: `Order was shipped via Decoopa carrier.`,
      //   },
      //   this.ctx,
      //   batch,
      // );

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  // orderShippedMaylerz
};
