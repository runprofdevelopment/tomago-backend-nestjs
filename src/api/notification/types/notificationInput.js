const schema = `
  input NotificationInput {
    title: LocalizationInput!
    body: LocalizationInput
    imageUrl: String
    payload: NotificationPayloadInput
  }

  input NotificationPayloadInput {
    key: PayloadTypeEnum
    value: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
