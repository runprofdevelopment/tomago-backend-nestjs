const schema = `
  input CategoryInput {
    name: LocalizationInput!
    image: AvatarInput
    isActive: Boolean
  }

  input SubcategoryInput {
    parent_id: Int!
    level: Int!
    position: Int!
    name: LocalizationInput!
    image: AvatarInput
    isActive: Boolean
  }

  input CategoryUpdateInput {
    name: LocalizationInput!
    image: AvatarInput
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;