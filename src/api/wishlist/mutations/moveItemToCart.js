const WishlistService = require('../../../services/customer-wishlist/wishlistService');

const schema = `
  moveItemToCart(data: MoveItemInput!): Cart!
`;

const resolver = {
  moveItemToCart: async (root, args, context) => {
    return await new WishlistService(context).moveItemToCart(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
