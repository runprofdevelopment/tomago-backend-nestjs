const DeviceTokenService = require('../../../services/customer-deviceToken/deviceTokenService');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  removeDeviceToken(token: String!): Boolean
`;

const resolver = {
  removeDeviceToken: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.customerEdit);
    await new DeviceTokenService(context).removeDeviceToken(args.token);
    return true;
  },
};

exports.schema = schema; 
exports.resolver = resolver;
