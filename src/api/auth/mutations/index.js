module.exports = [
  require('./authSendPasswordResetEmail'),
  require('./authSendEmailAddressVerificationEmail'),
  require('./authUpdateEmailVerification'),
  require('./authSendSignInWithEmailLink'),

  require('./authUpdateProfile'),
  require('./changeMyPassword'),
  require('./createAppCheckToken'),
  require('./customerCreateAccount'),
];