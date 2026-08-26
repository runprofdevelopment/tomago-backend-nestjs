const PackageStatusMylerz = require('../../../services/mylerz/getPackageStatusMylerz');

const schema = `
# Get package status by tracking number
getPackageStatusMylerz(trackingNumber: String!): JSON

# Get package status by order ID
getPackageStatusByOrderId(orderId: String!): JSON

# Get detailed tracking history
getDetailedTrackingHistory(trackingNumber: String!): JSON

# Save package status to database
savePackageStatus(trackingNumber: String!, statusData: JSON!): JSON
`;

const resolver = {
  getPackageStatusMylerz: async (root, args, context) => {
    const service = new PackageStatusMylerz(context);
    const data = await service.getPackageStatus(
      args.trackingNumber,
    );
    return data;
  },

  getPackageStatusByOrderId: async (
    root,
    args,
    context,
  ) => {
    const service = new PackageStatusMylerz(context);
    const data = await service.getPackageStatusByOrderId(
      args.orderId,
    );
    return data;
  },

  getDetailedTrackingHistory: async (
    root,
    args,
    context,
  ) => {
    const service = new PackageStatusMylerz(context);
    const data = await service.getDetailedTrackingHistory(
      args.trackingNumber,
    );
    return data;
  },

  savePackageStatus: async (root, args, context) => {
    const service = new PackageStatusMylerz(context);
    const data = await service.savePackageStatus(
      args.trackingNumber,
      args.statusData,
    );
    return data;
  },
};

exports.schema = schema;
exports.resolver = resolver;
