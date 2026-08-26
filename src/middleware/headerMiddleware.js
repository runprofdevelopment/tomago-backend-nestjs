
module.exports = async (req, res, next) => {
  req.language = req.headers['accept-language'] || 'en';
  req.ipAddress = req.headers['x-forwarded-for'] || req.ip;
  req.useragent = req.headers['user-agent'];
  req.platform = req.headers['platform'];
  req.appId = req.headers['appid'];
  
  if (req.language !== 'en' && req.language !== 'ar') req.language = 'en';

  const isIntrospection = req.body?.operationName === 'IntrospectionQuery';
  if (!isIntrospection) {
    console.log('IP_ADDRESS =', req.ipAddress);
  }
  return next();
};