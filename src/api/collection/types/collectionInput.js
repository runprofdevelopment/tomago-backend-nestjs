const schema = `
  input CollectionInput {
    name: LocalizationInput!
    subtitle: LocalizationInput
    slug: String
    image: AvatarInput
    display_order: Float
    is_featured: Boolean
    isActive: Boolean
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
