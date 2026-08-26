const resorces = [
  'auditLog',
  'auth',
  'iam',
  'customer-deviceToken',
  'customer-address',
  'wishlist',

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
  'mylerz',
];

const ALL_MUTATIONS = [];
for (const fileName of resorces) {
  if (fileName) {
    const mutations = require(`../api/${fileName}/mutations`);
    ALL_MUTATIONS.push(...mutations);
  }
}

module.exports = ALL_MUTATIONS;