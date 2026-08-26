const schema = `
  type SliderPage {
    rows: [Slider!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;