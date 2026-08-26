const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');

const config = require('./config')();
const env = config.env;

// Try to load environment variables from .env file, but don't fail if it doesn't exist
try {
  // First try to load from .env file
  require('dotenv').config({ path: '.env' });
  console.log('Loaded environment variables from .env file');
} catch (error) {
  console.log('No .env file found, trying environment-specific files');
  try {
    // Fall back to environment-specific files
    const ENV_PATH = env === 'production' ? '.env.production' : '.env.staging';
    require('dotenv').config({ path: ENV_PATH });
    console.log(`Loaded environment variables from ${ENV_PATH} file`);
  } catch (innerError) {
    console.log('No environment file found, using environment variables from Cloud Run');
  }
}

console.log('\n');
console.log(' - config.env =', config.env);
console.log(' - process.env.ENV =', process.env.ENV);
console.log(' - process.env.NODE_ENV =', process.env.NODE_ENV);

module.exports = class App {
  static async init() {
    let serviceAccount = null;

    try {
      serviceAccount = require(`./service-accounts/${env}.json`);
      console.log('App.init: Service account loaded successfully.', { env: env, projectId: serviceAccount.project_id });
    } catch (error) {
      if (env === 'test') {
        console.log('App.init: Running in test environment, skipping service account loading.');
        return;
      }

      console.error('App.init: Error loading service account for environment', env, error);
      throw error;
    }

    console.log(' - project_id =', serviceAccount.project_id);

    // process.env.GOOGLE_APPLICATION_CREDENTIALS = '/Users/apple/Documents/Full Stack Projects/Shamy Stores/source/backend/service-accounts/production.json';

    if (admin.apps.length === 0) {
      console.log(' - Environment =', config.env);
      console.log('App.init: Initializing Firebase Admin SDK...');

      try {
        // Initialize the Firebase Admin SDK with the provided configuration
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `https://${serviceAccount.project_id}-default-rtdb.europe-west1.firebasedatabase.app`, // Firebase Realtime Database URL
          storageBucket: `${serviceAccount.project_id}.appspot.com`,
        });
        console.log('App.init: Firebase Admin SDK initialized.');

        // Initialize Firebase client SDK
        const firebaseConfig = config.firebaseConfig;
        if (firebaseConfig) {
          initializeApp(firebaseConfig);
          console.log('App.init: Firebase client SDK initialized.');
        } else {
          console.warn('App.init: Firebase client config not found, skipping client initialization.');
        }
      } catch (adminError) {
        console.error('App.init: Failed to initialize Firebase Admin SDK:', adminError);
        throw new Error(`Firebase Admin initialization failed: ${adminError.message}`);
      }
    } else {
      console.log('App.init: Firebase Admin SDK already initialized. Skipping.');
    }
  }
};