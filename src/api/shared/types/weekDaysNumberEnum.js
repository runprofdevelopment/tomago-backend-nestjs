const schema = `
  enum WeekDaysNumberEnum {
    zero     # 0 Sunday 
    one      # 1 Monday
    two      # 2 Tuesday
    three    # 3 Wednesday
    four     # 4 Thursday
    five     # 5 Friday
    six      # 6 Saturday
  }
`;
  
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;