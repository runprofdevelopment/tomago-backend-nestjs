
const init = async () => {
  // const admin = require('firebase-admin');
  // admin.firestore().settings({ignoreUndefinedProperties:true});
  return;
};

const middleware = async (req, res, next) => {
  return next();
};

exports.init = init;
exports.middleware = middleware;
