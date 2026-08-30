const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class OrderTimeline extends AbstractEntityModel {
  constructor() {
    super('timeline', 'timeline', {
      order_id: new types.String(),
      event_type: new types.String(),
      event_description: new types.String(),
      // event_timestamp: new types.String(),
    })
  }
}

// {
//   orderCreated: 'Order was placed by the user.'
//   paymentProcessed: 'Payment was successfully processed.',
//   orderConfirmed: 'Order was confirmed by the system.',
//   orderInProduction: 'Order is in production.',
//   orderQualityCheck: 'Order is undergoing quality check.',
//   orderPacked: 'Order was packed and ready for shipping.',
//   orderShipped: 'Order was shipped via XYZ carrier.',
//   outForDelivery: 'Order is out for delivery.'
// }