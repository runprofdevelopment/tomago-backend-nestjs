// const admin = require('firebase-admin');
const colors = require('colors');
const config = require('../../config')();
const AppCheckService = require('../infrastructure/appCheckService');

/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
module.exports = async (req, res, next) => {
  console.log('\n========================= START APP CHECK HANDLER ========================');
  
  try {
    const language = req.headers['accept-language'] || 'en';
    const appCheckToken = req.headers['x-firebase-appcheck'];

    req.language = language;
    req.appCheckToken = appCheckToken;

    console.log(colors.green('* Environment ='), colors.magenta(config.env));
    if (config.env == 'localhost' || config.env == 'production') return next();

    if (!appCheckToken) {
      res.status(401).send('Unauthorized appcheck');
      return;
    }

    const appCheckClaims = await AppCheckService.verifyToken(appCheckToken);
    // const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken, { consume: true });

    if (appCheckClaims.alreadyConsumed) {
      res.status(401).send('Unauthorized appcheck');
      return;
    }

    // If verifyToken() succeeds, continue with the next middleware function in the stack.
    return next();
  } catch (error) {
    const ERROR = { code: error.code, message: error.message };
    console.error(colors.red('\nError while verifying App Check Token:'), ERROR, '\n');
    res.status(401).send('Unauthorized appcheck');
  }
};