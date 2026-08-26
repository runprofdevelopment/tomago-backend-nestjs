const DeviceTokenService = require('../../../services/customer-deviceToken/deviceTokenService');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  addDeviceToken(token: String!): Boolean
`;

const resolver = {
  addDeviceToken: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.customerEdit);
    await new DeviceTokenService(context).addDeviceToken(args.token);
    return true;
  },
};

exports.schema = schema; 
exports.resolver = resolver;
