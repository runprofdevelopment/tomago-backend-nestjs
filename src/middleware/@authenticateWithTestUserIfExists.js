// const colors = require('colors');
const AuthFirebaseService = require('../infrastructure/auth/authFirebaseService');
const AuthService = require('../services/auth/authService');
const config = require('../../config')();
// const Utils = require('./utils');

/**
 * Fills the request with the authenticateWithTestUser in case it exists.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
module.exports = async (req, res, next) => {
  const userAutoAuthenticatedEmailForTests = config && config.userAutoAuthenticatedEmailForTests;

  if (!userAutoAuthenticatedEmailForTests) {
    return next();
  }

  try {
    let authUser = await AuthFirebaseService.getUserByEmail(
      userAutoAuthenticatedEmailForTests,
    );

    if (!authUser) {
      authUser = await AuthFirebaseService.createUser({
        email: userAutoAuthenticatedEmailForTests, 
        password: '12345678', 
        displayName: 'Default User for Tests', 
        photoURL: '', 
        // phoneNumber: '', 
        emailVerified: false, 
        disabled: false,
      });
    }

    console.log(
      `Authenticated with default user: ${userAutoAuthenticatedEmailForTests}`,
    );

    const currentUser = await AuthService.findOrCreateFromAuth(
      authUser.uid,
    );

    if (currentUser.disabled) {
      throw new Error(
        `User '${currentUser.email}' is disabled`,
      );
    }

    req.currentUser = currentUser;

    return next();
  } catch (error) {
    console.error(
      `Error while authenticating with default user: ${userAutoAuthenticatedEmailForTests}:`,
      error,
    );

    res.status(403).send('Unauthorized');
    return;
  }
};