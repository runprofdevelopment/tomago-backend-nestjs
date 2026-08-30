const schema = `
  type WishlistShare {
    shareToken: String!
    shareUrl: String!
  }

  type SharedWishlist {
    id: String
    shareToken: String
    items: [ JSON! ]
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
