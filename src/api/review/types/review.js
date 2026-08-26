const schema = `
  type Review {
    id: String
    productId: String
    title: String
    body: String
    rating: Float
    media: MediaGallery
    
    #entityName: ReviewalTypeEnum
    #entityId: String
    reviewer: JSON
    product: Product

    createdBy: String
    createdAt: DateTime
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
