const schema = `
  enum AmountTypeEnum {
    percent
    fixed
  }

  enum DealStatusEnum {
    active
    inactive
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
