const schema = `
  type ProjectImage {
    image_url: String
    sort_order: Float
  }

  input ProjectImageInput {
    image_url: String
    sort_order: Float
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
