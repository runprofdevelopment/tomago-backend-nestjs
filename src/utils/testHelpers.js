const validate = require('./validationHelper');
const result = validate.isValidEGPhoneNumber('+202222222222');
// const result = validate.isValidPhoneNumber('+202222222222', 'US');
result 
  ? console.log('The phone number is valid.', result)
  : console.log('The phone number is not valid.');



console.log('Email is valid =', validate.isValidEmail('momoom@g.com'));