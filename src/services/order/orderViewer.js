const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const UserRepository = require('../../database/repositories/userRepository');
const CartViewer = require('../cart/cartViewer');
const TimelineViewer = require('../order-timeline/timelineViewer');
const Order = require('../../database/models/order');


module.exports = class OrderViewer {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.selectedFields = context?.selectedFields || [];
    this.model = new Order()
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async findById(id) {
    const order = await this.repository.findDocumentById(id);
    if (order === null) throw new Error('Order not found')
    

    return await this.populate(order);
  }

  async findByUserId(userId) {
    const records = FirebaseHelper.mapCollection(
      await admin.firestore().collection(this.collectionName)
        .where('userID', '==', userId).orderBy('createdAt', 'desc')
        .get()
    );
    
    const orders = await this.populateAll(records);
    return orders;
  }

  async listCustomerOrders(args) {
    if (!args.customerId) throw new Error('customerId is required');

    args['filter'] = args.filter || [];
    args['filter'].push({ field: 'userID', operator: 'equal', value: args.customerId });

    const response = await this.repository.listCollection(args);
    // for (let order of response.rows) {
    //   order['userInfo'] = await UserRepository.findById(order.userID)
    // }
    response.rows = await this.populateAll(response.rows);
    return response;
  }

  async listWithPagination(args) {
    args['filter'] = args.filter || []
    const response = await this.repository.listCollection(args);
    // for (let order of response.rows) {
    //   order['userInfo'] = await UserRepository.findById(order.userID)
    // }
    response.rows = await this.populateAll(response.rows);
    return response;
  }

  /**
   * Populates the records with all its relations.
   * @param {JSON[]} records
   */
  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record))
    );
  }

  /**
   * Populates the record with all its relations.
   * @param {JSON} record
   */
  async populate(record) {
    if (!record) {
      return record;
    }
    
    if (this.selectedFields.includes('shipment')) {
      record['shipment'] = await FirebaseHelper.findDocument('shipment', record.shippingId);
    }
    
    // if (this.selectedFields.includes('items')) {}
    
    const items = [];
    for (let item of record.items) {
      const current_item = await new CartViewer(this).getProductInfo(item);
      let statusNo =false
      if (item.status === 'returnedDeleveryOnTheWay') {
        statusNo = true;
      }


      items.push({
        product: current_item?.product,
        variant: current_item?.variant,
        quantity: item.quantity,
        price: current_item?.variant?.price,
        status: item.status,
        isReturned: statusNo,
      });
    }
    record['items'] = items;
    
    if (this.selectedFields.includes('timeline')) {
      record['timeline'] = await TimelineViewer.fetchOrderTimeline(record.id);
    }
    return record;
  }
}