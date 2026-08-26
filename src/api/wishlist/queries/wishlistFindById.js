const WishlistService = require('../../../services/customer-wishlist/wishlistService');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  wishlistFindById(id: String!): [ Product! ]
`;

const resolver = {
  wishlistFindById: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.wishlistRead);
    return new WishlistService(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
