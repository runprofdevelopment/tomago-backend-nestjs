const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin if not already initialized
function normalizeBucketName(name) {
  if (!name) return undefined;
  return String(name).replace(/^gs:\/\//, '');
}

try {
  const config = require('../../config')();
  const serviceAccount = require(`../../service-accounts/${config.env}.json`);
  
  if (!admin.apps.length) {
    const storageBucket = normalizeBucketName(config.storageBucketName) || 'tomago-staging.appspot.com';
    console.log('Initializing Firebase Admin with config:', {
      projectId: serviceAccount.project_id,
      storageBucket: storageBucket,
      env: config.env,
      storageBucketName: config.storageBucketName,
      databaseId: config.databaseId || 'default',
    });
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
      databaseURL: `https://${config.projectId}.firebaseio.com`
    });

    const databaseId = config.databaseId || 'default';
    admin.firestore = () => {
      const db = getFirestore(admin.app(), databaseId);
      db.settings({ ignoreUndefinedProperties: true });
      return db;
    };
    
    console.log('Firebase Admin initialized successfully with bucket:', storageBucket);
  } else {
    console.log('Firebase Admin already initialized');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  console.error('This may cause storage operations to fail.');
}

module.exports = admin;