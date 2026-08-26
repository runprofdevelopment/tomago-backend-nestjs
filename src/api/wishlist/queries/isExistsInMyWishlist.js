const WishlistService = require('../../../services/customer-wishlist/wishlistService');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  isExistsInMyWishlist(variant_id: String!): Boolean
`;

const resolver = {
  isExistsInMyWishlist: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.wishlistRead);
    return new WishlistService(context).existsInMyWishlist(args.variant_id);
  }
};

exports.schema = schema;
exports.resolver = resolver;