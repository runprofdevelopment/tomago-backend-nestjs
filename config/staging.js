const firebaseConfig = require('../firebase-config/staging.json');

module.exports = {
  env: 'staging',
  projectName: 'Tomago Staging',
  projectId: 'tomago-staging',
  projectNumber: '7125900076',

  /** Client URL used when sending emails. */
  clientUrl: 'https://www.decoopa.com/auth/action',
  dashboardUrl: 'https://seller.decoopa.com',
  bundleId: '',
  packageName: '',
  dynamicLinkDomain: '',
  baseUrl:
    'https://tomago-staging-7125900076.europe-west3.run.app',
  storageBucketName: 'gs://tomago-staging.appspot.com',
  databaseId: 'default',
  // TODO: replace with Web API key from Firebase Console → Project settings → Your apps
  apiKey: 'REPLACE_WITH_TOMAGO_STAGING_WEB_API_KEY',
  orderWebhook:
    'https://webhooks-order-ux7zuoslvq-ey.a.run.app',
  walletWebhook:
    'https://webhooks-wallet-ux7zuoslvq-ey.a.run.app',

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
    '2b95214ed13d7b4feaed67': 'website',
  },

  appTypes: ['dashboard', 'website'],

  /**
   * When this email is set, all requests will automatically authenticate using this email.
   * Useful for testing purposes.
   */
  userAutoAuthenticatedEmailForTests:
    'mohamedali.runprof@gmail.com',
  defaultUser: 'mohamedali.runprof@gmail.com',
};
