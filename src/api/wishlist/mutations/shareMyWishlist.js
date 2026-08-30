const WishlistService = require('../../../services/customer-wishlist/wishlistService');

const schema = `
  shareMyWishlist: WishlistShare!
`;

const resolver = {
  shareMyWishlist: async (root, args, context) => {
    return new WishlistService(context).shareMyWishlist();
  },
};

exports.schema = schema;
exports.resolver = resolver;
