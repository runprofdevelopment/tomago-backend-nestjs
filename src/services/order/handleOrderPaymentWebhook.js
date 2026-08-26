const FirebaseHelper = require('../../database/utils/firebaseHelper');
const TimelineEventCreator = require('../order-timeline/timelineEventCreator');
const CartClearer = require('../cart/cartClearer');
const OrderEditor = require('./orderEditor');
const OrderTransactionService = require('../transaction/orderTransatctionService');

// handleOrderOnlineWebhook
// [1] Validate the payment information provided by the customer.
// [2] Charge the customer's payment method using a payment gateway integration.
// [3] Update the order status in the database to "paid".
// [4] Send a payment confirmation email to the customer.
// [5] Return the successful payment result.

exports.handleOrderPaymentWebhook = async (payload) => {
  try {
    const orderId = payload.merchantOrderId;
    const amountPaid = parseFloat(payload.amount);
    const order = await FirebaseHelper.findDocument('order', orderId);
    const userId = order.userID;

    const currentUser = await FirebaseHelper.findDocument('user', userId);
    const context = { currentUser, language: 'en' };

    const batch = await FirebaseHelper.createBatch();

    const transactionId = order.totalPrice > amountPaid
      ? await new OrderTransactionService(context).createOrderTransaction({ ...order, totalPrice: amountPaid }, batch)
      : await new OrderTransactionService(context).createOrderTransaction(order, batch);

    const totalAmountPaid = amountPaid + (order.partialAmountPaid || 0);

    console.log('🔍 Webhook: Original order items:', order.items);
    console.log('🔍 Webhook: Payment payload:', {
      orderId,
      amountPaid,
      paymentMethod: payload.paymentMethod,
      sessionId: payload.sessionId,
      status: payload.status
    });

    // Update the order status in the database to "paid" and item statuses
    const updatedItems = order.items.map(item => ({
      ...item,
      status: 'paid' // Update each item status to 'paid'
    }));

    console.log('🔍 Webhook: Updated order items for database:', updatedItems);

    // Enhanced payment info update
    const updateData = {
      id: orderId,
      financialStatus: order.totalPrice == totalAmountPaid ? 'paid' : 'partialPaid',
      partialAmountPaid: order.totalPrice > totalAmountPaid ? totalAmountPaid : 0,
      transactionId: transactionId,
      transactionIds: order?.transactionIds?.length 
        ? [ ...order.transactionIds, transactionId ]
        : [ transactionId ],
      items: updatedItems, // Update items with paid status
    };

    // Update order status based on current status and payment confirmation
    if (order.orderStatus === 'waitingPaymentConfirmation') {
      updateData.orderStatus = 'pendingAcceptance';
      console.log('🔍 Webhook: Updating order status from "waitingPaymentConfirmation" to "pendingAcceptance"');
    } else if (order.orderStatus === 'pendingAcceptance' && order.financialStatus !== 'paid') {
      // Keep as pendingAcceptance but ensure it's properly marked as paid
      console.log('🔍 Webhook: Order already in pendingAcceptance, confirming payment');
    } else {
      console.log('🔍 Webhook: Order status remains:', order.orderStatus);
    }

    // Update payment method if provided in payload
    if (payload.paymentMethod) {
      updateData.paymentMethod = payload.paymentMethod;
      console.log('🔍 Webhook: Updating payment method to:', payload.paymentMethod);
    }

    // Update session information if provided
    if (payload.sessionId) {
      updateData.sessionId = payload.sessionId;
      console.log('🔍 Webhook: Updating session ID to:', payload.sessionId);
    }

    // Update server webhook URL if provided
    if (payload.serverWebhook) {
      updateData.serverWebhook = payload.serverWebhook;
      console.log('🔍 Webhook: Updating server webhook URL');
    }

    // Update session URL if provided
    if (payload.sessionUrl) {
      updateData.sessionUrl = payload.sessionUrl;
      console.log('🔍 Webhook: Updating session URL');
    }

    await new OrderEditor(context).update(updateData, batch);

    console.log('✅ Webhook: Order and payment info updated in database.');

    // Create new event with order payment processed
    await TimelineEventCreator.execute({
      orderId: orderId,
      event_type: 'paymentProcessed',
      event_description: 'Payment was successfully processed.',
    }, context, batch);

    // Emptying the User's Shopping Cart 
    await CartClearer.clearUserCart(userId, batch);

    await FirebaseHelper.commitBatch(batch);
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    throw error;
  }
}