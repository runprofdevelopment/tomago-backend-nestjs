const schema = `
  enum PayloadTypeEnum {
    order
    product
    auction
    collection
    staticOccasion
    staticCollection
    return
    wallet
    customRequest
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
