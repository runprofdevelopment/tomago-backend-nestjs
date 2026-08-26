const AuthFirebaseService = require('./authFirebaseService');
const config = require('../../config')();
const AuthService = require('../services/auth/authService');
const MobileAuthMiddleware = require('./mobileAuthMiddleware');

/**
 * Authenticates and fills the request with the user if it exists.
 * If no token is passed, it continues the request but without filling the currentUser.
 * If userAutoAuthenticatedEmailForTests exists and no token is passed, it fills with this user for tests.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
module.exports = async (req, res, next) => {

  if (
    (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    // const defaultUser = config.tokens && config.tokens.defaultUser;
    // const accountType = req.headers['account-type']
    const defaultUser = config
      ? config.defaultUser || config.userAutoAuthenticatedEmailForTests
      : null

    if (defaultUser) {
      try {
        const authUser = await AuthFirebaseService.getUserByEmail(defaultUser);
        console.log('auth user =', authUser)
        console.log(`Authenticated with default user: ${defaultUser}`);

        const currentUser = await AuthService.findOrCreateFromAuth(authUser.uid, {
          accountType: req.accountType,
          language: req.language
        });

        console.log('currentUser', currentUser);

        if (currentUser.disabled) {
          throw new Error(
            `User '${currentUser.email}' is disabled`,
          );
        }

        req.currentUser = currentUser;

        return next();
      } catch (error) {
        console.error(
          `Error while authenticating with default user: ${defaultUser}:`,
          error,
        );

        res.status(403).send('Unauthorized');
        return;
      }
    }

    return next();
  }
};