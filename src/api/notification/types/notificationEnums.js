const schema = `
  enum PayloadTypeEnum {
    order
    product
    auction
    collection
    staticOccasion
    staticCollection
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
