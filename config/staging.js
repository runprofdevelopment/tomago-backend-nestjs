const firebaseConfig = require('../firebase-config/staging.json');

module.exports = {
  env: 'staging',
  projectName: 'Tomago Staging',
  projectId: 'tomago-staging',
  projectNumber: '7125900076',

  /** Client URL used when sending emails. */
  clientUrl: 'https://tomago-staging.firebaseapp.com/auth/action',
  dashboardUrl: 'https://tomago-staging.firebaseapp.com',
  bundleId: '',
  packageName: '',
  dynamicLinkDomain: '',
  baseUrl:
    'https://tomago-staging-7125900076.europe-west3.run.app',
  storageBucketName: 'gs://tomago-staging.appspot.com',
  databaseId: 'default',
  apiKey: 'AIzaSyDwk10UHl0H6pF4I9UqSCV9MlwAIueSa7w',
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

  dynalinks: {
    apiKey: process.env.DYNALINKS_API_KEY,
    apiUrl:
      process.env.DYNALINKS_API_URL ||
      'https://dynalinks.app/api/v1/links',
    subdomain: process.env.DYNALINKS_SUBDOMAIN || 'tomago',
    iosAppId: process.env.DYNALINKS_IOS_APP_ID,
    androidAppId: process.env.DYNALINKS_ANDROID_APP_ID,
  },
};
