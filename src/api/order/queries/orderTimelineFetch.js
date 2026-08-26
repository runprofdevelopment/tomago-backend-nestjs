const timelineViewer = require('../../../services/order-timeline/timelineViewer');

const schema = `
  orderTimelineFetch(orderId: String!): Timeline
`;

const resolver = {
  orderTimelineFetch: async (root, args, context) => {
    return timelineViewer.fetchOrderTimeline(args.orderId);
  }
};

exports.schema = schema
exports.resolver = resolver