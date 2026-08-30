const schema = `
  input ProjectInput {
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
    thumbnail: AvatarInput
    hero_image: AvatarInput
    images: [ProjectImageInput]
    featured_product_ids: [String]
    is_featured: Boolean
    status: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
