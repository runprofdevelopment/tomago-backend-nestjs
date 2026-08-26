const shipmentService = require('../../../services/shipment/shipmentService');

const schema = `
  findShipment(id: String!): Shipment
`;

const resolver = {
  findShipment: async (root, args, context) => {
    return new shipmentService(context).findById(args.id);
  }
};

exports.schema = schema
exports.resolver = resolver