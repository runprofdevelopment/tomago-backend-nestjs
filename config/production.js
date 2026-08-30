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
  baseUrl: 'https://tomago-649000455905.europe-west3.run.app',
  storageBucketName: 'gs://tomago-fdaa6.appspot.com',
  databaseId: 'default',
  apiKey: 'AIzaSyCLROlQt7yb6cVJItzwoY_nO15UlrGyM4Q',

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
    from: 'Tomago <mohamedelnemr.runprof@gmail.com>',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'mohamedelnemr.runprof@gmail.com',
      pass: 'rwkm vuqx plce wppq',
    },
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
