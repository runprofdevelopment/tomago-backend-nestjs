const schema = `
  type Category {
    id: String
    name: Localization
    image: Avatar
    isActive: Boolean
    deletedAt: DateTime
    deletedBy: String

    parent_id: String
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

function asId(value) {
  return value == null ? value : String(value);
}

const resolver = {
  Category: {
    id: (category) => asId(category.id),
    parent_id: (category) => asId(category.parent_id),
  },
};

exports.schema = schema;
exports.resolver = resolver;