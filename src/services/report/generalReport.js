const admin = require('firebase-admin');
const { Filter } = require('firebase-admin/firestore');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Order = new (require('../../database/models/order'));
const ReturnRequest = new (require('../../database/models/returnRequest'));

module.exports = class GeneralReport {
  // constructor(context) {
  //   this.ctx = context;
  //   this.currentUser = context && context.currentUser;
  //   this.language = context && context.language;
  //   this.model = new Review();
  //   this.collectionName = this.model.collectionName;
  //   this.repository = new FirestoreRepository(this.collectionName);
  // }
  
  static async fetch(filter) {
    try {
      console.log('GeneralReport.fetch: Starting with filter:', filter);
      
      const startDate = filter && filter.createdAtRange && filter.createdAtRange.start;
      const endDate = filter && filter.createdAtRange && filter.createdAtRange.end;
      
      console.log('GeneralReport.fetch: Date range:', { startDate, endDate });
      
      const orderRef = admin.firestore().collection(Order.collectionName);
      const ReturnRef = admin.firestore().collection(ReturnRequest.collectionName);
      
      // [1] Get ALL orders (for total count) - regardless of status
      let allOrdersQuery = orderRef;
      if (startDate && endDate) {
        allOrdersQuery = allOrdersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
      }
      const allOrdersSnapshot = await allOrdersQuery.count().get();
      const totalAllOrders = allOrdersSnapshot.data().count;
      console.log('GeneralReport.fetch: Total all orders:', totalAllOrders);

      // [2] Get completed orders (received + paid) for revenue calculations
      let completedOrdersQuery = orderRef.where('orderStatus', '==', 'received').where('financialStatus', '==', 'paid');
      if (startDate && endDate) {
        completedOrdersQuery = completedOrdersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
      }
      
      console.log('GeneralReport.fetch: Executing completed orders aggregate query...');
      const aggregateQuery = completedOrdersQuery.aggregate({
        totalOrders: admin.firestore.AggregateField.count(),
        totalOrdersUnits: admin.firestore.AggregateField.sum('totalQuantity'),
        totalOrdersPrice: admin.firestore.AggregateField.sum('totalPrice'),
      });
      const orderSnapshot = await aggregateQuery.get();
      const orderReport = orderSnapshot.data();
      console.log('GeneralReport.fetch: Completed orders aggregate result:', orderReport);

      // [2] Get the pending orders
      let pendingOrdersQuery = orderRef.where('orderStatus', '==', 'pending');
      if (startDate && endDate) {
        pendingOrdersQuery = pendingOrdersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
      }
      const pendingOrdersSnapshot = await pendingOrdersQuery.count().get();
      const pendingOrders = pendingOrdersSnapshot.data().count;
      console.log('GeneralReport.fetch: Pending orders count:', pendingOrders);
      
      // [3] Get the canceled orders
      let canceledOrdersQuery = orderRef.where(
        Filter.or(Filter.where('orderStatus', '==', 'canceled'), Filter.where('isCanceled', '==', true))
      );
      if (startDate && endDate) {
        canceledOrdersQuery = canceledOrdersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
      }
      const canceledOrdersSnapshot = await canceledOrdersQuery.count().get();
      const canceledOrders = canceledOrdersSnapshot.data().count;
      console.log('GeneralReport.fetch: Canceled orders count:', canceledOrders);

      // [4] Get the pending returns
      let pendingReturnsQuery = ReturnRef.where('status', '==', 'pending');
      if (startDate && endDate) {
        pendingReturnsQuery = pendingReturnsQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
      }
      const pendingReturnsSnapshot = await pendingReturnsQuery.count().get();
      const pendingReturns = pendingReturnsSnapshot.data().count;
      console.log('GeneralReport.fetch: Pending returns count:', pendingReturns);

      const result = {
        totalOrders: totalAllOrders || 0, // Use total all orders for the dashboard
        totalOrdersUnits: orderReport.totalOrdersUnits || 0,
        totalOrdersPrice: orderReport.totalOrdersPrice || 0,
        canceledOrders: canceledOrders || 0,
        pendingOrders: pendingOrders || 0,
        pendingReturns: pendingReturns || 0,
        // Add additional metrics for clarity
        completedOrders: orderReport.totalOrders || 0, // Orders that are received + paid
      };
      
      console.log('GeneralReport.fetch: Final result:', result);
      return result;
    } catch (error) {
      console.error('GeneralReport.fetch: Error occurred:', error);
      throw error;
    }
  }
};