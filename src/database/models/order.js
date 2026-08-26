const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

const BILLING_INFORMATION = ['address', 'province', 'country', 'area', 'city', 'firstName', 'lastName', 'phoneNumber', 'zip'];
const ORDER_STATUS = [
  'pendingAcceptance',
  'pendingDelivery',
  'shipped',
  'received',
  'notreceived',
  'cancelled',
  'waitingPaymentConfirmation',
];
const FINANCIAL_STATUS = ['pending', 'refunded', 'partialRefund', 'pendingRefund', 'partialPaid', 'paid', 'unpaid'];

module.exports = class Order extends AbstractEntityModel {
  constructor() {
    super('order', 'order', {
      id: new types.String(),
      userID: new types.String(),
      ipAddress: new types.String(),
      userInfo: new types.Json([
        'id',
        'authenticationUid',
        'fullName',
        'firstName',
        'lastName',
        'phoneNumber',
        'email',
      ]),
      addressId: new types.String(),
      billingInfo: new types.Json(BILLING_INFORMATION),
      orderStatus: new types.Enumerator(ORDER_STATUS, 'pendingAcceptance'),
      financialStatus: new types.Enumerator(FINANCIAL_STATUS),
      paymentMethod: new types.Enumerator(['cod', 'credit', 'installment', 'e_wallet', 'wallet']),
      useWallet: new types.Boolean(false),
      items: new types.JsonArray([
        'productId',
        'variantId',
        'quantity',
        'price',
        'status',
      ]),
      transactionId: new types.String(),
      transactionIds: new types.StringArray(),
      shippingId: new types.String(),
      cancelReason: new types.String(),

      // ======================= Payment Info ======================= //
      sessionId: new types.String(),
      sessionUrl: new types.String(),
      serverWebhook: new types.String(),

      // ======================= Order Pricing ======================= //
      currency: new types.Enumerator(['USD', 'EGP', 'SAR', 'AED'], 'EGP'),
      partialAmountPaid: new types.Number(),
      // netPrice: new types.Number(),
      vatPercentage: new types.Number(),
      vatAmount: new types.Number(),
      totalDiscount: new types.Number(),
      shippingCost: new types.Number(),
      cashOnDeliveryFees: new types.Number(),
      subTotalPrice: new types.Number(),
      totalPrice: new types.Number(),

      totalQuantity: new types.Number(),
      isCanceled: new types.Boolean(),
      isReturned: new types.Boolean(),
    })
  }
}