const functions = require('firebase-functions');
const ErrorHandler = require('../../errors/errorHandler');
const EmailSender = require('../../infrastructure/email/emailSender');
const GeneratingEmailActionLinks = require('../../infrastructure/generatingEmailActionLinks');
// Initialize Firebase Admin
require('../../infrastructure/firebaseInit');

//#region [ Default Emails Template ]
  // const WelcomeEmail = require('./welcomeEmail');
  const ResetPasswordEmail = require('./passwordResetEmail');
  const ForgetPasswordEmail = require('./forgetPasswordEmail');
  const EmailAddressVerificationEmail = require('./emailAddressVerificationEmail');
  const InvitationEmail = require('./invitationEmail');
//#endregion

module.exports = class EmailService {
  constructor() {}

  static async sendWelcomeEmail(language, email, accountType) {
    throw new Error('Not implemented');
  }

  static async sendUnsubscribeEmail(language, email, accountType) {
    throw new Error('Not implemented');
  }

  static async sendInvitationEmail(email, language = 'en', accountType, context) {
    try {
      EmailSender._verifyEmailSenderConfigured();

      const Email_Template = new InvitationEmail(language, email, context);
      if (!Email_Template) {
        functions.logger.log(`There is no email template set up for this account type as '${accountType}'`)
        new ErrorHandler({
          errorCode: 'EMAIL_TEMPLATE_NOT_FOUND',
          message: `There is no email template set up for this account type as '${accountType}'`, 
        })
      }

      return new EmailSender(Email_Template).send();
    } catch (error) {
      throw error
    }   
  }

  static async sendResetPasswordEmail(email, language = 'en', accountType) {
    try {
      EmailSender._verifyEmailSenderConfigured();
      const link = await GeneratingEmailActionLinks.generatePasswordResetLink(email, language);
      // const data = await Utils._getEmailData(email, accountType) ;
      const Email_Template = new ResetPasswordEmail(language, email, link);
      if (!Email_Template) {
        functions.logger.log(`There is no email template set up for this account type as '${accountType}'`)
        new ErrorHandler({
          errorCode: 'EMAIL_TEMPLATE_NOT_FOUND',
          message: `There is no email template set up for this account type as '${accountType}'`, 
        })
      }

      return new EmailSender(Email_Template).send();
    } catch (error) {
      throw error
    }   
  }

  static async sendEmailAddressVerification(email, language = 'en', accountType) {
    try {
      console.log({ email, language, accountType });
      EmailSender._verifyEmailSenderConfigured();
      // Generate the standard Firebase link first
      const link = await GeneratingEmailActionLinks.generateEmailVerificationLink(email, language);

      // Post-process the link so the main URL is locale-prefixed:
      // https://www.decoopa.com/auth/action?... -> https://www.decoopa.com/{locale}/auth/action?...
      let finalLink = link;
      try {
        const url = new URL(link);
        const locale = (language || 'en').toLowerCase().startsWith('ar') ? 'egypt-ar' : 'egypt-en';

        // Only rewrite when host is our production site and path is the generic /auth/action
        if (url.hostname.endsWith('decoopa.com') && url.pathname === '/auth/action') {
          url.pathname = `/${locale}/auth/action`;
          finalLink = url.toString();
        }
      } catch (e) {
        // If URL parsing fails, fall back to the original link
        console.warn('Could not rewrite verification link, sending original:', e);
      }

      // const data = await Utils._getEmailData(email);
      const Email_Template = new EmailAddressVerificationEmail(language, email, finalLink);
      
      if (!Email_Template) {
        new ErrorHandler({
          errorCode: 'EMAIL_TEMPLATE_NOT_FOUND',
          message: `There is no email template set up for this account type as '${accountType}'`, 
        })
      }

      return new EmailSender(Email_Template).send();
    } catch (error) {
      throw error
    }
  }
 
  static async sendSignInLinkEmail(email, language, accountType) {
    try {
      console.log({ email, language, accountType });
      EmailSender._verifyEmailSenderConfigured();
      const ActionCodeSettings = {
        url: 'https://decoopa-admin.web.app/auth/login',
        handleCodeInApp: true, // This must be true.
        // iOS: {
        //   bundleId: 'com.example.ios'
        // },
        // android: {
        //   packageName: 'com.example.android',
        //   installApp: true,
        //   minimumVersion: '12'
        // },
        // dynamicLinkDomain: 'example.page.link'
      };
      const link = await GeneratingEmailActionLinks.generateSignInWithEmailLink(email, language, accountType, ActionCodeSettings)
      // const data = await Utils._getEmailData(email);
      const Email_Template = new EmailAddressVerificationEmail(language, email, link);
      
      if (!Email_Template) {
        functions.logger.log(`There is no email template set up for this account type as '${accountType}'`)
        new ErrorHandler({
          errorCode: 'EMAIL_TEMPLATE_NOT_FOUND',
          message: `There is no email template set up for this account type as '${accountType}'`, 
        })
      }
  
      return new EmailSender(Email_Template).send();
    } catch (error) {
      throw error;
    } 
  }

  async _getEmailData(email) {
    const defaultUserName = email ? email.match(/^.+(?=@)/)[0] : '';
    
    const collection = FirebaseHelper.mapCollection(
      await admin.firestore().collection(`user`)
        .where('email', '==', email)
        .limit(1).get()
    )
    const account = collection.length ? collection[0] : null;
    console.log(`\nUser is exist in firestore? ${account ? '[Yes]' : '[No]'}`);
    if (account) {
      return {
        logo: account.avatar ? account.avatar.publicUrl : null,
        name: account.fullName ? account.fullName : defaultUserName,
      }
    } 

    const authUser = await AuthFirebaseService.getUserByEmail(email);
    console.log(`Auth User is exist? ${authUser ? '[Yes]' : '[No]'}\n`);
    if (authUser) {
      return {
        logo: authUser.photoURL ? authUser.photoURL : null,
        name: authUser.displayName ? authUser.displayName : defaultUserName,
      }
    }
  }
};