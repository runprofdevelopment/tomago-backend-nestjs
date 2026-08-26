const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Shipment extends AbstractEntityModel {
  constructor() {
    super('shipment', 'shipment', {
      id: new types.String(),
      shipping_company: new types.String(),
      tracking_number: new types.String(),
      tracking_link: new types.String(),
      orderId: new types.String()
    })
  }
}
