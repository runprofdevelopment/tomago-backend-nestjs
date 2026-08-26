const schema = `
  enum AccountTypeEnum {
    owner
    admin
    customer
  }

  enum AllUserTypeEnum {
    owner
    admin
    customer
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;