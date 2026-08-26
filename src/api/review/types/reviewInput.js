const schema = `
  input ReviewInput {
    title: String!
    body: String!
    rating: Float
    media: MediaGalleryInput
    userName: String
    email: String
  }
`;

// entityName: ReviewalTypeEnum!
// entityId: String!
// reviewalType: ReviewalTypeEnum!

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;