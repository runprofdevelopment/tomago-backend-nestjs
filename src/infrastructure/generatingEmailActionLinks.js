// Use initialized Firebase Admin
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const config = require('../../config')();
const _get = require('lodash/get');
const ErrorHandler = require('../errors/errorHandler');
const AuthFirebaseService = require('./auth/authFirebaseService');

module.exports = class GeneratingEmailActionLinks {
  static async generatePasswordResetLink(email, language = 'en', appType, actionCodeSettings) {
    try {
      this.APP_TYPE = appType || 'default'
      const ACTION_CODE_SETTINGS = actionCodeSettings || this._getActionCodeSettings(language);
      const link = await admin.auth().generatePasswordResetLink(email, ACTION_CODE_SETTINGS);
      return link
    } catch (error) {
      console.log('Error ==>', { code: error.code, message: error.message});
      throw this.formateEmailError(error, language)
    }
  }

  static async generateEmailVerificationLink(email, language = 'en', appType, actionCodeSettings, checkElalreadyVerified = true) {
    try {
      if (checkElalreadyVerified) {
        try {
          const authUser = await AuthFirebaseService.getUserByEmail(email)
          if (authUser && authUser.emailVerified === true) {
            console.log('generateEmailVerificationLink: Email is already verified:', email);
            throw new ErrorHandler({ 
              errorCode: 'EMAIL_VERIFIED', 
              message: language === 'ar' ? 'البريد الإلكتروني محقق بالفعل' : 'Email is already verified' 
            });
          }
        } catch (authError) {
          // If user doesn't exist in Firebase Auth, that's okay - we can still generate a verification link
          // The user might exist in the database but not in Firebase Auth yet
          console.log('generateEmailVerificationLink: User not found in Firebase Auth, continuing:', email);
          if (authError.code === 'auth/user-not-found') {
            // This is expected for new users, continue with link generation
          } else {
            // Re-throw other auth errors
            throw authError;
          }
        }
      }

      this.APP_TYPE = appType || 'default'
      const ACTION_CODE_SETTINGS = actionCodeSettings || this._getActionCodeSettings(language);
      const link = await admin.auth().generateEmailVerificationLink(email, ACTION_CODE_SETTINGS);
      return link
    } catch (error) {
      console.log('Error ==>', { code: error.code, message: error.message});
      
      // If it's already our custom error, re-throw it
      if (error.errorCode === 'EMAIL_VERIFIED') {
        throw error;
      }
      
      throw this.formateEmailError(error, language)
    }
  }

  static async generateSignInWithEmailLink(email, language = 'en', appType, actionCodeSettings) {
    try {
      this.APP_TYPE = appType || 'default'
      const ACTION_CODE_SETTINGS = actionCodeSettings || this._getActionCodeSettings(language);
      const link = await admin.auth().generateSignInWithEmailLink(email, ACTION_CODE_SETTINGS);
      return link
    } catch (error) {
      console.log('Error ==>', { code: error.code, message: error.message});
      throw this.formateEmailError(error, language)
    }
  }

  static formateEmailError(error, language) {
    let code, message

    switch (error.code) {
      case 'auth/email-not-found':
        code = 'NOT_FOUND'
        message = language === 'ar' ? 'لم يتم العثور على البريد الإلكتروني' : 'Email not found'
        break;
      case 'auth/user-not-found':
        code = 'NOT_FOUND'
        message = language === 'ar' ? 'لم يتم العثور على المستخدم' : 'User not found'
        break;
      case 'auth/invalid-email':
        code = 'INVALID_EMAIL'
        message = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format'
        break;
      case 'auth/too-many-requests':
        code = 'TOO_MANY_ATTEMPTS'
        message = language === 'ar' ? 'تم إرسال الكثير من طلبات التحقق. يرجى المحاولة مرة أخرى بعد ساعة واحدة.' : 'Too many verification requests sent. Please try again after 1 hour.'
        break;
      case 'auth/internal-error':
        code = 'INTERNAL_ERROR'
        message = language === 'ar' ? 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً' : 'Server error. Please try again later'
        break;
      default:
        code = 400
        message = language === 'ar' ? 'خطأ في إرسال رابط التحقق' : 'Error sending verification link'
        break;
    }

    return new ErrorHandler({
      errorCode: code,
      message: message,
    })
  }

  static _getActionCodeSettings(language = 'en') {
    const rawUrl = _get(config, 'clientUrl', undefined);

    if (!rawUrl) {
      functions.logger.log('actionCodeSettings =', undefined);
      return undefined;
    }

    // Normalize to site origin in case clientUrl contains a path like '/auth/action'
    let origin;
    try {
      const u = new URL(rawUrl);
      origin = u.origin; // e.g., https://www.decoopa.com
    } catch (e) {
      // Fallback: assume rawUrl already is an origin without path
      origin = rawUrl.replace(/\/$/, '');
    }

    // Determine the locale prefix based on the language
    const locale = language === 'ar' ? 'egypt-ar' : 'egypt-en';
    const continueUrl = `${origin}/${locale}/auth/action`;

    const actionCodeSettings = {
      url: continueUrl, // Use the localized URL
      handleCodeInApp: true,
    };

    functions.logger.log('actionCodeSettings =', actionCodeSettings);
    return actionCodeSettings;
  }

  static get _actionCodeSettings() {
    // This is now a fallback for any methods that haven't been updated
    return this._getActionCodeSettings('en');
  }
};