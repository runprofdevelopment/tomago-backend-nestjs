const firebaseConfig = require('../firebase-config/production.json');

module.exports = {
  env: 'production',
  projectName: 'Tomago',
  projectId: 'tomago-fdaa6',
  projectNumber: '649000455905',

  /** Client URL used when sending emails. */
  clientUrl: 'https://www.decoopa.com/auth/action',
  dashboardUrl: 'https://seller.decoopa.com',
  bundleId: '',
  packageName: '',
  dynamicLinkDomain: '',
  baseUrl: 'https://decoopa-335317890504.europe-west3.run.app',
  storageBucketName: 'gs://tomago-fdaa6.appspot.com',
  databaseId: 'default',
  // TODO: replace with Web API key from Firebase Console → Project settings → Your apps
  apiKey: 'REPLACE_WITH_TOMAGO_PRODUCTION_WEB_API_KEY',

  // Webhook endpoints for Kashier callbacks (Google Cloud Functions - 2nd gen)
  orderWebhook: 'https://europe-west3-decoopa-50ce2.cloudfunctions.net/webhooks-order',
  walletWebhook: 'https://europe-west3-decoopa-50ce2.cloudfunctions.net/webhooks-wallet',

  /** Your web app's Firebase configuration */ 
  firebaseConfig,

  /**
   * Configuration to allow email sending used on: backend/src/services/shared/email/emailSender.js
   * - More info: https://nodemailer.com
   */
  email: {
    from: 'Decoopa <no-reply@decoopa.com>', 
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'no-reply@decoopa.com',     // Your Microsoft account email
      pass: 'wbcxsdpjxzkfbpxq',         // App password generated
      // pass: 'Decoopa@2020',          // Your Microsoft account password
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false       // Optional: Handle self-signed certificates if needed
    },
    // debug: true,
    // logger: true,
  },

  /** Enables GraphiQL See: https://github.com/graphql/graphiql */
  graphiql: true,

  appIds: {
    '331d9376652d7ad1f2bcfd': 'dashboard',
    '08e196a298926521f2bcfd': 'website',
  },
  
  appTypes: [ 'dashboard', 'website' ],

  /**
   * When this email is set, all requests will automatically authenticate using this email.
   * Useful for testing purposes.
   */
  userAutoAuthenticatedEmailForTests: 'mohamedali.runprof@gmail.com',
  defaultUser: 'mohamedali.runprof@gmail.com',
};
