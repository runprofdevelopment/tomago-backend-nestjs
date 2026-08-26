// const admin = require('firebase-admin');
// const functions = require('firebase-functions');
// const HelperClass = require('../../src/database/utils/helperClass');

const createEmptyWallet = async (event) => {
  try {
    const userID = event.params.userID;
    console.log('Creating empty wallet for user:', userID);
    
    const context = {
      currentUser: {
        id: userID
      }
    }
    
    const WalletCreator = require('../../src/services/wallet/walletCreator');
    await new WalletCreator(context).createEmptyWallet(userID);
    
    console.log('Successfully created empty wallet for user:', userID);
  }
  catch (error) {
    console.error('Error creating empty wallet for user:', event.params.userID, error);
    throw error
  }
}

// const createEmptyWallet = async (snapshot, context) => {
//   try {
//     const userID = context.params.userID;
//     context = {
//       currentUser: {
//         id: userID
//       }
//     }
//     const WalletCreator = require('../../src/services/wallet/walletCreator');
//     await new WalletCreator(context).createEmptyWallet(userID);
//   }
//   catch (error) {
//     throw error
//   }
// }


module.exports = {
  createEmptyWallet
};
