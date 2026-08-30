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
  const databaseId = config.databaseId || 'default';

  if (!admin.apps.length) {
    const storageBucket = normalizeBucketName(config.storageBucketName) || 'tomago-staging.appspot.com';
    console.log('Initializing Firebase Admin with config:', {
      projectId: serviceAccount.project_id,
      storageBucket: storageBucket,
      env: config.env,
      storageBucketName: config.storageBucketName,
      databaseId,
    });

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
      databaseURL: `https://${config.projectId}.firebaseio.com`,
    });

    console.log('Firebase Admin initialized successfully with bucket:', storageBucket);
  } else {
    console.log('Firebase Admin already initialized');
  }

  let firestoreDb;

  const firestoreStatics = {};
  for (const key of Object.keys(admin.firestore)) {
    firestoreStatics[key] = admin.firestore[key];
  }

  const firestoreFactory = () => {
    if (!firestoreDb) {
      firestoreDb = getFirestore(admin.app(), databaseId);
      firestoreDb.settings({ ignoreUndefinedProperties: true });
    }
    return firestoreDb;
  };

  Object.assign(firestoreFactory, firestoreStatics);

  // Always bind Firestore to the configured named database (e.g. "default").
  // Simple assignment does not override firebase-admin's firestore getter after init.
  Object.defineProperty(admin, 'firestore', {
    configurable: true,
    writable: true,
    value: firestoreFactory,
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  console.error('This may cause storage operations to fail.');
}

module.exports = admin;