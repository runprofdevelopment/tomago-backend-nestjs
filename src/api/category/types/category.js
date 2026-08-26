const schema = `
  type Category {
    id: Int
    name: Localization
    image: Avatar
    isActive: Boolean
    isRemoved: Boolean

    parent_id: Int
    level: Int
    position: Int

    product_count: Int
    children: [ JSON! ]
    path: Localization
    
    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;