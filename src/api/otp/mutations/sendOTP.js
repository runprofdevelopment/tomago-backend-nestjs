const OTPSender = require('../../../services/OTP/OTPSender');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  sendOTP(data: OTPInput!): JSON
`;

const resolver = {
  sendOTP: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.customerEdit);
    return await new OTPSender(context).sendOTP(args.data);
  },
};

exports.schema = schema; 
exports.resolver = resolver;