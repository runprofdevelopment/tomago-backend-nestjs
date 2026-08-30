const CustomerSettingsService = require('../../../services/customer-settings/customerSettingsService');

const schema = `
  myCustomerSettings: CustomerSettings!
`;

const resolver = {
  myCustomerSettings: async (root, args, context) => {
    return new CustomerSettingsService(context).findOrCreateDefaults();
  },
};

exports.schema = schema;
exports.resolver = resolver;
