const schema = `
  input SliderFilterInput {
    id: String
    exact_title: NormalizedFilterInput
    title: NormalizedFilterInput
    createdAtRange: [ DateTime ]
  }
`;
  
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;