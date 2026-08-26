// process.env.NODE_ENV = 'staging';
process.env.NODE_ENV = 'production';
const App = require('../app');
App.init();  // Initializes Firebase Authentication

const admin = require('firebase-admin');

async function cleanAuthTable() {
  const auth = admin.auth();  // Get the Firebase Authentication instance
  
  const listUsersResult = await auth.listUsers();  // Get all users

  const users = listUsersResult.users.map(userRecord => userRecord);

  const uids = users.map(user => user.uid);
  await auth.deleteUsers(uids); // Delete all users in batches
}

cleanAuthTable();