const App = require('../app');
App.init();  // Initializes Firebase Authentication

// async function sendSignInWithEmailLink() {
//   const AuthGeneratingEmailActionLinks = require('./src/auth/authGeneratingEmailActionLinks');
//   // const email = 'mohamedali.runprof@gmail.com';
//   const email = 'eng.mohamedali99@gmail.com';
//   const actionCodeSettings = {
//     url: 'https://admin.shamystores.com/auth/login', // URL you want to redirect back to. The domain (www.example.com) for this URL must be whitelisted in the Firebase Console.
//     handleCodeInApp: true, // This must be true for email link sign-in.
//   }
//   await AuthGeneratingEmailActionLinks.sendSignInWithEmailLink('en', email, actionCodeSettings);
// }


//#region [ Run Functions ]
  // sendSignInWithEmailLink();
//#endregion


//#region [ ]
// const readline = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// readline.question(`What's your name?`, name => {
//   console.log(`Hi ${name}!`);
//   readline.close();
// });
//#endregion

const { PRODUCTS_INDEX } = process.env;

async function fixAlgoliaVariants() {
  const AlgoliaSearch = require('./src/infrastructure/algolia/algoliaSearch');
  const Algolia = new AlgoliaSearch();
  Algolia.initIndex(PRODUCTS_INDEX);

  const records = [];
  const items = await Algolia.retrieveAllObjects();

  for (const item of items) {
    let variants = item.variants || [];

    variants = variants.map(variant => {
      return {
        ...variant,
        available: variant.status === 'active',
      }
      // const newVariant = variant;
      // if (variant.variant_id === item.variant_id) {
      //   newVariant['available'] = data['status'] === 'active';
      // }
      // return newVariant;
    });

    records.push({
      objectID: item.objectID,
      variants,
    })
  }

  await Algolia.updateObjects(records)
}
fixAlgoliaVariants();