const schema = `
  type Project {
    id: String
    public_id: String
    name: String
    slug: String
    tagline: String
    brief_title: String
    client_name: String
    start_date: Date
    duration: String
    location: String
    scope: String
    description: String
    pieces_delivered: String
    design_style: String
    category: String
    thumbnail: Avatar
    hero_image: Avatar
    images: [ProjectImage]
    featured_product_ids: [String]
    is_featured: Boolean
    status: String

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
