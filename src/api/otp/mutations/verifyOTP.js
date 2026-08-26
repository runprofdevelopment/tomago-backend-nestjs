const OTPVerifier = require('../../../services/OTP/OTPVerifier');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  verifyOTP(otp: String!): Boolean
`;

const resolver = {
  verifyOTP: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.customerEdit);
    await new OTPVerifier(context).verifyOTP(args.otp);
    return true;
  },
};

exports.schema = schema; 
exports.resolver = resolver;