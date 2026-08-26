const schema = `
  type Brand {
    id: String
    name: Localization
    imageUrl: String
    isActive: Boolean
    
    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
