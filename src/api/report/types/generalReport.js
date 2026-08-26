const schema = `
  type GeneralReport {
    totalOrders: Int
    totalOrdersUnits: Int
    totalOrdersPrice: Float
    canceledOrders: Int
    pendingOrders: Int
    pendingReturns: Int
    completedOrders: Int
  }

  input GeneralReportFilterInput {
    createdAtRange: DateTimeRangeFilterInput
  }
  
  input DateTimeRangeFilterInput {
    start: DateTime!
    end: DateTime!
  }
`;
// createdAtRange: [ DateTime ]

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
