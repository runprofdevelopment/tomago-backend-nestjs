const schema = `
  type Shipment {
    id: String
    shipping_company: String
    tracking_number: String
    tracking_link: String
    order: Order

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
