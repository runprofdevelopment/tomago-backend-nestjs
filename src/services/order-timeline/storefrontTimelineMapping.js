/**
 * Storefront-friendly mapping between order statuses and timeline event types.
 */
const ORDER_STATUS_TIMELINE = {
  pendingAcceptance: {
    event_type: 'orderCreated',
    event_description: 'Order was placed by the user.',
  },
  confirmed: {
    event_type: 'orderConfirmed',
    event_description: 'Order was confirmed by the system.',
  },
  inProduction: {
    event_type: 'orderInProduction',
    event_description: 'Order is in production.',
  },
  qualityCheck: {
    event_type: 'orderQualityCheck',
    event_description: 'Order is undergoing quality check.',
  },
  pendingDelivery: {
    event_type: 'orderPacked',
    event_description: 'Order was packed and ready for shipping.',
  },
  shipped: {
    event_type: 'orderShipped',
    event_description: 'Order was shipped.',
  },
  received: {
    event_type: 'orderReceived',
    event_description: 'Order was received.',
  },
  notreceived: {
    event_type: 'orderNotReceived',
    event_description: 'Order was marked as not received.',
  },
  cancelled: {
    event_type: 'orderCancelled',
    event_description: 'Order was cancelled.',
  },
  failedDelivery: {
    event_type: 'failedDelivery',
    event_description: 'Delivery attempt failed.',
  },
  waitingPaymentConfirmation: {
    event_type: 'paymentPending',
    event_description: 'Waiting for payment confirmation.',
  },
};

const TIMELINE_EVENT_TYPES = {
  orderCreated: 'Order was placed by the user.',
  paymentProcessed: 'Payment was successfully processed.',
  orderConfirmed: 'Order was confirmed by the system.',
  orderInProduction: 'Order is in production.',
  orderQualityCheck: 'Order is undergoing quality check.',
  orderPacked: 'Order was packed and ready for shipping.',
  orderShipped: 'Order was shipped.',
  outForDelivery: 'Order is out for delivery.',
  orderReceived: 'Order was received.',
  orderNotReceived: 'Order was marked as not received.',
  orderCancelled: 'Order was cancelled.',
  failedDelivery: 'Delivery attempt failed.',
  paymentPending: 'Waiting for payment confirmation.',
};

function mapStatusToTimelineEvent(orderStatus) {
  return ORDER_STATUS_TIMELINE[orderStatus] || null;
}

function getTimelineEventDescription(eventType) {
  return TIMELINE_EVENT_TYPES[eventType] || null;
}

module.exports = {
  ORDER_STATUS_TIMELINE,
  TIMELINE_EVENT_TYPES,
  mapStatusToTimelineEvent,
  getTimelineEventDescription,
};
