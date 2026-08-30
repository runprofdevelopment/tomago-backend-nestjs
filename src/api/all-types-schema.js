const resorces = [
  'shared',
  'auditLog',
  'auth',
  'iam',
  'customer-deviceToken',
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
  'otp',
  'report',
  'export',
];

const ALL_TYPES = [];
for (const fileName of resorces) {
  if (fileName) {
    const types = require(`../api/${fileName}/types`);
    ALL_TYPES.push(...types);
  }
}

module.exports = ALL_TYPES;
