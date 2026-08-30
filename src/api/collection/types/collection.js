const schema = `
  type Collection {
    id: String
    name: Localization
    subtitle: Localization
    slug: String
    image: Avatar
    display_order: Float
    is_featured: Boolean
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
