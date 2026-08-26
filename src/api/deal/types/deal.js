const schema = `
  type Deal {
    id: String
    name: String
    startDate: Date
    endDate: Date
    discountType: String
    discountAmount: Float
    currency: String
    ribbonName: String
    ribbonColor: String
    ribbonBackground: String
    status: String
    items: [ AlgoliaProduct ]

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;