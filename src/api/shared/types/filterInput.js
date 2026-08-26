const schema = `
  input FilterInput {
    field: String!
    operator: QueryOperatorEnum!
    value: JSON
    # values: [ JSON ]
  }

  enum QueryOperatorEnum {
    less
    lessEqual
    greater
    greaterEqual
    equal
    notEqual
    in
    notIn
    arrayContains
    arrayContainsAny
    startsWith
    like
  }

  enum DataTypeEnum {
    string
    number
    boolean
    array
  }
`;

// valueDataType: DataTypeEnum!
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;