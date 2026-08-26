const AddressViewer = require('../../../services/customer-address/addressViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  addressFind(customerId: String!, addressId: String!): Address
`;

const resolver = {
  addressFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.addressRead);
    return new AddressViewer(context).findById(
      args.customerId, 
      args.addressId
    );
  }
};

exports.schema = schema;
exports.resolver = resolver;
