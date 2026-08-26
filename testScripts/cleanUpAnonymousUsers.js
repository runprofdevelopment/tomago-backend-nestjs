// process.env.NODE_ENV = 'staging';
process.env.NODE_ENV = 'production';
const App = require('../app');
App.init();  // Initializes Firebase Authentication

const admin = require('firebase-admin');

async function cleanUpAnonymousUsers() {
  const auth = admin.auth();  // Get the Firebase Authentication instance
  
  // const targetDate = new Date();
  const today= new Date();
  const listUsersResult = await auth.listUsers();  // Get all users
  
  // Filter anonymous users created before the specified date
  const anonymousUsersToDelete = listUsersResult.users.filter(userRecord => {
    const isAnonymous = !userRecord.providerData.length || userRecord.providerData.some(provider => provider.providerId === 'anonymous');
    // const creationTime = new Date(userRecord.metadata.creationTime);
    // return isAnonymous && creationTime < today;
    return isAnonymous;
  });
  const uids = anonymousUsersToDelete.map(user => user.uid);
  
  await auth.deleteUsers(uids); // Delete anonymous users in batches
}

cleanUpAnonymousUsers();