const resorces = [
  'auditLog',
  'auth',
  'iam',
  'customer-address',
  'wishlist',
  'customerSettings',
  'paymentMethod',
  'customRequest',

  'slider',
  'notification',
  'brand',
  'category',
  'product',
  'inventory',
  'review',
  'contactUs',
  'order',
  'cart',
  'staticPages',
  'wallet',
  'voucher',
  'withdrawalRequest',
  'transaction',
  'shipment',
  'returnRequest',
  'settings',
  'deal',
  'adContainer',
  'ad',
  'decoopaAccount',
  'report',
];

const ALL_QUERIES = [];
for (const fileName of resorces) {
  if (fileName) {
    const queries = require(`../api/${fileName}/queries`);
    ALL_QUERIES.push(...queries);
  }
}

module.exports = ALL_QUERIES;
