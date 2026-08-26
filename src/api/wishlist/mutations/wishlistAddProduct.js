const WishlistService = require('../../../services/customer-wishlist/wishlistService');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  wishlistAddProduct(variantIds: [ String! ]): Boolean
`;

const resolver = {
  wishlistAddProduct: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.wishlistEdit);
    const UserID = context && context.currentUser && context.currentUser.id;
    await new WishlistService(context).addProductsToWishlist(UserID, args.variantIds);
    return true
  },
};

exports.schema = schema;
exports.resolver = resolver;
