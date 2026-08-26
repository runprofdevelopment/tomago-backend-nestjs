const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const CartViewer = require('../cart/cartViewer');

const Variant = new (require('../../database/models/product-variant'));
const Product = new (require('../../database/models/product'));
const ReturnRequest = require('../../database/models/returnRequest');

module.exports = class ReturnService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ReturnRequest();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  } 

  async createReturnRequest(data) {
    try {
      const order = FirebaseHelper.mapDocument(
        await admin.firestore().collection('order').doc(data['orderID']).get()
      );
      if (order === null) {
        throw new Error('Order not found')
      }
      if (order.orderStatus !== 'received') {
        throw new Error('Cannot return an order that was not received');
      }
      let returned = data['items']
      for (var i = 0; i < returned.length; i++) {
        if (returned[i].quantity <= 0) {
          throw new Error('Please enter valid quantities')
        }
        let found = order['items'].find((item) => {
          if (item.variantId === returned[i]['variantId']) {
            if (item.quantity < returned[i].quantity) {
              throw new Error(`Item with id: ${item.productId} & variant : ${item.variantId} quantity invalid`)
            }
            returned[i]['price'] = item.price
            return true
          }
        })
        if (!found) {
          throw new Error('Item was not found in order')
        }
      }
      console.log("RETURNED", returned)
      console.log("ORDER", order)
      console.log("USER", this.currentUser)
      console.log("DATA", data)
      // now you need to check for warranty of each item. (in the returned array or the order array it doesn't matter)
      // ignore the warranty for now
      data['userID'] = this.currentUser.id;
      data = this.model.cast(data);
      data['type'] = 'partialrefund';
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      console.log('record', record)
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(record.id);
     
    } catch (e) {
      throw e
    }
  }

  async createFullyRefundRequest(data) {
    try {
      const order = FirebaseHelper.mapDocument(
        await admin.firestore().collection('order').doc(data['orderID']).get()
      );
      if (order === null) {
        throw new Error('Order not found')
      }
      if (order.orderStatus !== 'received') {
        throw new Error('Cannot return an order that was not received');
      }
      data['items'] = order['items']
      data['userID'] = this.currentUser.id
      data = this.model.cast(data)
      data['type'] = 'fullrefund';
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language
      });
      console.log('record', record)
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(record.id);
    }
    catch (e) {
      throw e
    }
  }

  async viewMyReturnRequests() {
    const requests = FirebaseHelper.mapCollection(
      await admin.firestore().collection(this.collectionName)
        .where('userID', '==', this.currentUser.id)
        .get()
    )
    return requests
  }


  async listReturnRequests(args) {
    args['filter'] = args.filter || []
    // args['filter'].push({ field: 'accountType', operator: 'in', value: ['admin', 'owner'] });
    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows); // Find Relations
    console.log("response", response)
    return response
  }

  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

  async populate(record) {
    if (!record) return record;
    
    record['user'] = await FirebaseHelper.findDocument('user', record.userID);
    
    const items = [];
    for (let item of record.items) {
      const current_item = await new CartViewer(this).getProductInfo(item);

      items.push({
        product: current_item?.product,
        variant: current_item?.variant,
        quantity: item.quantity,
        price: current_item?.variant?.price,
        status: item.status,
      });
    }
    record['items'] = items;

    // const variantIds = record['items'].map((item) => item.variantId);
    // const productIds = record['items'].map((item) => item.productId);
    // record['variants'] = await FirebaseHelper.findRelation(
    //   Variant.collectionName,
    //   variantIds,
    // ) || [];

    // record['products'] = await FirebaseHelper.findRelation(
    //   Product.collectionName,
    //   productIds,
    // ) || [];

    return record;
  }
};