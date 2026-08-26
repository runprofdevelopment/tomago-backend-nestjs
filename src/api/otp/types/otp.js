const schema = `
  input OTPInput {
    targetName: TargetNameEnum!
    targetId: String!
  }

  enum TargetNameEnum {
    user
    addresses
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;