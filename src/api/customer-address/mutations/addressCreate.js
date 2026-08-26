const AddressCreator = require('../../../services/customer-address/addressCreator');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  addressCreate(customerId: String, data: AddressInput!): Address!
`;

const resolver = {
  addressCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.addressCreate);

    const response = await new AddressCreator(context).create(args.customerId, args.data);
    return response;
  },
};

exports.schema = schema;
exports.resolver = resolver;