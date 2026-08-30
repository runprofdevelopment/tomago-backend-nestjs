const WishlistService = require('../../../services/customer-wishlist/wishlistService');

const schema = `
  wishlistByShareToken(token: String!): SharedWishlist!
`;

const resolver = {
  wishlistByShareToken: async (root, args, context) => {
    return new WishlistService(context).findByShareToken(args.token);
  },
};

exports.schema = schema;
exports.resolver = resolver;
