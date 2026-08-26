const WishlistService = require('../../../services/customer-wishlist/wishlistService');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  findMyWishlist: [ JSON! ]
`;

const resolver = {
  findMyWishlist: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.wishlistRead);
    const UserID = context && context.currentUser && context.currentUser.id;
    return new WishlistService(context).findById(UserID);
  }
};

exports.schema = schema;
exports.resolver = resolver;