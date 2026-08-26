const schema = `
  enum ProductStatusEnum {
    active
    inactive
    archived
    draft
  }

  enum DimensionUnitEnum {
    mm
    cm
    m
    in
    ft
  }

  enum WeightUnitEnum {
    g
    lb
    kg
    ft
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
