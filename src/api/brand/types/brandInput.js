const schema = `
  input BrandInput {
    name: LocalizationInput!
    websiteLink: String
    imageUrl: String
    isActive: Boolean
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
