const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class CustomerSettings extends AbstractEntityModel {
  constructor() {
    super('customerSettings', 'customerSettings', {
      customer_id: new types.String(),
      orderUpdatesEnabled: new types.Boolean(true),
      promotionalEmailsEnabled: new types.Boolean(true),
      newCollectionAlertsEnabled: new types.Boolean(true),
      newsletterEnabled: new types.Boolean(false),
      preferredLanguage: new types.String(),
      defaultCurrency: new types.String(),
      shippingRegion: new types.String(),
      twoFactorEnabled: new types.Boolean(false),
      loginAlertsEnabled: new types.Boolean(true),
      passwordLastChangedAt: new types.DateTime(),
    });
  }
};
