const CustomerSettingsService = require('../../../services/customer-settings/customerSettingsService');

const schema = `
  updateMyCustomerSettings(data: CustomerSettingsInput!): CustomerSettings!
`;

const resolver = {
  updateMyCustomerSettings: async (root, args, context) => {
    return new CustomerSettingsService(context).update(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
