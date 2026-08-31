const functions = require('firebase-functions');
const ErrorHandler = require('../../errors/errorHandler');
const EmailSender = require('../../infrastructure/email/emailSender');
const GeneratingEmailActionLinks = require('../../infrastructure/generatingEmailActionLinks');
const DynalinksService = require('../../infrastructure/dynalinks/dynalinksService');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');
const EmailVerificationTokenService = require('../auth/emailVerificationTokenService');
const AuthService = require('../auth/authService');
const UserRepository = require('../../database/repositories/userRepository');
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
      const finalLink = await DynalinksService.createLink({
        name: 'Password Reset Link',
        path: DynalinksService.buildPath('reset-password'),
        url: link,
        deepLinkValue: link,
      });
      // const data = await Utils._getEmailData(email, accountType) ;
      const Email_Template = new ResetPasswordEmail(language, email, finalLink);
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

  static async sendEmailAddressVerification(email, language = 'en', currentUser) {
    try {
      console.log({ email, language, userId: currentUser && currentUser.id });
      EmailSender._verifyEmailSenderConfigured();

      if (!currentUser || !currentUser.id) {
        throw new ErrorHandler({
          errorCode: 'USER_REQUIRED',
          message:
            language === 'ar'
              ? 'المستخدم مطلوب لإرسال رابط التحقق'
              : 'Authenticated user is required to send verification email',
        });
      }

      if (currentUser.emailVerified === true) {
        throw new ErrorHandler({
          errorCode: 'EMAIL_VERIFIED',
          message:
            language === 'ar'
              ? 'البريد الإلكتروني محقق بالفعل'
              : 'Email is already verified',
        });
      }

      try {
        const authUser = await AuthFirebaseService.getUserByEmail(email);
        if (authUser && authUser.emailVerified === true) {
          throw new ErrorHandler({
            errorCode: 'EMAIL_VERIFIED',
            message:
              language === 'ar'
                ? 'البريد الإلكتروني محقق بالفعل'
                : 'Email is already verified',
          });
        }
      } catch (authError) {
        if (authError && authError.code === 'EMAIL_VERIFIED') {
          throw authError;
        }
        if (authError && authError.code !== 'auth/user-not-found') {
          console.warn(
            'sendEmailAddressVerification: Firebase Auth lookup failed:',
            authError.message || authError,
          );
        }
      }

      let databaseUser =
        (await UserRepository.findByEmail(email)) ||
        (await UserRepository.findByAuthenticationUid(
          currentUser.authenticationUid || currentUser.id,
        ));

      if (!databaseUser) {
        databaseUser = await AuthService.findOrCreateFromAuth(
          currentUser.authenticationUid || currentUser.id,
          {
            language,
            accountType: currentUser.accountType || 'customer',
          },
        );
      }

      const rawToken = await EmailVerificationTokenService.createToken({
        userId: databaseUser.id,
        email,
        authenticationUid:
          databaseUser.authenticationUid ||
          currentUser.authenticationUid ||
          currentUser.id,
      });

      const getConfig = require('../../../config');
      const cfg = getConfig();
      const baseUrl = (
        process.env.VERIFY_EMAIL_BASE_URL ||
        cfg.baseUrl ||
        'http://localhost:8080'
      ).replace(/\/$/, '');
      const destinationUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;

      const finalLink = await DynalinksService.createLink({
        name: 'Email Verification Link',
        path: DynalinksService.buildPath('verify-email'),
        url: destinationUrl,
        deepLinkValue: destinationUrl,
      });

      const Email_Template = new EmailAddressVerificationEmail(
        language,
        email,
        finalLink,
      );

      if (!Email_Template) {
        new ErrorHandler({
          errorCode: 'EMAIL_TEMPLATE_NOT_FOUND',
          message: `There is no email template set up for this account type`,
        });
      }

      return new EmailSender(Email_Template).send();
    } catch (error) {
      throw error;
    }
  }
 
  static async sendSignInLinkEmail(email, language, accountType) {
    try {
      console.log({ email, language, accountType });
      EmailSender._verifyEmailSenderConfigured();
      const config = require('../../../config')();
      const ActionCodeSettings = {
        url: `${String(config.dashboardUrl || 'https://tomago-staging.firebaseapp.com').replace(/\/$/, '')}/auth/login`,
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
      const finalLink = await DynalinksService.createLink({
        name: 'Sign In Link',
        path: DynalinksService.buildPath('sign-in'),
        url: link,
        deepLinkValue: link,
      });
      // const data = await Utils._getEmailData(email);
      const Email_Template = new EmailAddressVerificationEmail(language, email, finalLink);
      
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