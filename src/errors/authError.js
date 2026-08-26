const { i18n, i18nExists } = require('../i18n');

module.exports = class AuthError extends Error {
  constructor({ language, messageCode, message, errorCode, statusCode = 401 }) {
    let messageText;

    if (messageCode && i18nExists(language, messageCode)) {
      messageText = i18n(language, messageCode);
    }

    messageText = messageText || message;
    messageText = messageText || i18n(language, 'errors.auth.invalid_credentials');

    super(messageText);
    this.code = errorCode || 'auth/unknown-error';
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }

  static invalidCredentials(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.invalid_credentials',
      errorCode: 'auth/invalid-credentials',
      statusCode: 401
    });
  }

  static userNotFound(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.user_not_found',
      errorCode: 'auth/user-not-found',
      statusCode: 401
    });
  }

  static userDisabled(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.user_disabled',
      errorCode: 'auth/user-disabled',
      statusCode: 401
    });
  }

  static invalidToken(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.invalid_token',
      errorCode: 'auth/invalid-token',
      statusCode: 401
    });
  }

  static tokenExpired(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.token_expired',
      errorCode: 'auth/token-expired',
      statusCode: 401
    });
  }

  static refreshTokenRequired(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.refresh_token_required',
      errorCode: 'auth/refresh-token-required',
      statusCode: 400
    });
  }

  static invalidRefreshToken(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.invalid_refresh_token',
      errorCode: 'auth/invalid-refresh-token',
      statusCode: 401
    });
  }

  static internalError(language) {
    return new AuthError({
      language,
      messageCode: 'errors.auth.internal_error',
      errorCode: 'auth/internal-error',
      statusCode: 500
    });
  }
}; 