const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Notification extends AbstractEntityModel {
  constructor() {
    super('notification', 'notification', {
      title: new types.Localization(),
      body: new types.Localization(),
      imageUrl: new types.String(),
      payload: new types.Json(['key', 'value']),
      isRead: new types.Boolean(false),
      isNew: new types.Boolean(true),
      // isRemoved: new types.Boolean(false),
    });
  }
};