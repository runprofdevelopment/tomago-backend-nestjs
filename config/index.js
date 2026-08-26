module.exports = function get() {
  const CLOUD_RUN_ENV = process.env.NODE_ENV || process.env.ENV;
  const isLocalhost = !CLOUD_RUN_ENV || CLOUD_RUN_ENV === 'development';
  
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('CONFIG LOADER: Loading configuration...');
  console.log(`CONFIG LOADER: NODE_ENV = ${process.env.NODE_ENV}`);
  console.log(`CONFIG LOADER: ENV = ${process.env.ENV}`);
  console.log(`CONFIG LOADER: CLOUD_RUN_ENV = ${CLOUD_RUN_ENV}`);
  console.log(`CONFIG LOADER: isLocalhost = ${isLocalhost}`);
  
  const config = isLocalhost
    ? require('./localhost')
    : require(`./${CLOUD_RUN_ENV}`);

  console.log(`CONFIG LOADER: Loaded config for environment: ${config.env}`);
  console.log(`CONFIG LOADER: clientUrl = ${config.clientUrl}`);
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

  return config;
};