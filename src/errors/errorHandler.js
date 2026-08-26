const { i18n, i18nExists } = require('..//i18n');

function stringify(value) {
  switch (typeof value) {  
    case 'string': return value;
    case 'object': return JSON.stringify(value);
    default: return String(value);
  }
};

module.exports = class ErrorHandler extends Error {
  constructor({ language, messageCode, message, errorCode }) {
    let messageText;

    if (messageCode && i18nExists(language, messageCode)) {
      messageText = i18n(language, messageCode);
    }

    messageText = messageText || message;
    messageText = messageText || i18n(language, 'errors.validation.message');

    // super(messageText);
    super(stringify(messageText));
    this.code = errorCode || 500;
  }

  static byMessageCode(language, messageCode, code) {
    return new ErrorHandler(language, messageCode, null, code)
  }
  static byMessage(language, message, code) {
    return new ErrorHandler(language, null, message, code)
  }
};