// The Cloud Functions for Firebase SDK to set up triggers and logging.
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");

const ScheduleRuntimeOpts = {
  timeoutSeconds: 540,          // Timeout in seconds (max 540)
  memory: "256Mi",              // Memory allocation (128MB to 16GB)
  cpu: 0.5,                     // CPU allocation (0.5 to 4)
  // maxInstances: 10,             // Max instances allowed
  // minInstances: 1               // Keep one instance warm
};


// const options = {
//   /** The schedule, in Unix Crontab or AppEngine syntax. */
//   schedule: string;
//   /** The timezone that the schedule executes in. */
//   timeZone?: timezone | Expression<string> | ResetValue;
//   /** The number of retry attempts for a failed run. */
//   retryCount?: number | Expression<number> | ResetValue;
//   /** The time limit for retrying. */
//   maxRetrySeconds?: number | Expression<number> | ResetValue;
//   /** The minimum time to wait before retying. */
//   minBackoffSeconds?: number | Expression<number> | ResetValue;
//   /** The maximum time to wait before retrying. */
//   maxBackoffSeconds?: number | Expression<number> | ResetValue;
//   /** The time between will double max doublings times. */
//   maxDoublings?: number | Expression<number> | ResetValue;
// }

const VerifyVariantSale = require('../src/services/product/verifyVariantSale');
/**
 * Run once a day at midnight ()
 * Run a job every day, 0 0 represents midnight (12:00 AM) 
 * Manually run the task here https://console.cloud.google.com/cloudscheduler
 */
exports.verifySaleOnVariantsStarted = onSchedule("every day 00:05", ScheduleRuntimeOpts, async (event) => {
  try {
    logger.log('\n============================================= START RUNNING VERIFY VARIANTS SALE STARTED =============================================');
   
    await VerifyVariantSale.verifySaleOnVariantsStarted();
    
    logger.log('\n============================================= FINISH RUNNING VERIFY VARIANTS SALE STARTED =============================================');
  } catch (error) {
    logger.error('Error occurred:', error.message);
  }
});

/** Run a job every day, 0 0 represents midnight (12:00 AM) */
exports.verifySaleOnVariantsEnded = onSchedule("every day 00:10", ScheduleRuntimeOpts, async (event) => {
  try {
    logger.log('\n============================================= START RUNNING VERIFY VARIANTS SALE ENDED =============================================');
   
    await VerifyVariantSale.verifySaleOnVariantsEnded();
    
    logger.log('\n============================================= FINISH RUNNING VERIFY VARIANTS SALE ENDED =============================================');
  } catch (error) {
    logger.error('Error occurred:', error.message);
  }
});

const VerifyDealRunning = require('../src/services/deals/verifyDealRunning');
exports.verifyDealStarted = onSchedule("every day 00:15", ScheduleRuntimeOpts, async (event) => {
  try {
    logger.log('\n============================================= START RUNNING VERIFY VARIANTS DEAL STARTED =============================================');
   
    await VerifyDealRunning.verifyDealStarted();
    
    logger.log('\n============================================= FINISH RUNNING VERIFY VARIANTS DEAL STARTED =============================================');
  } catch (error) {
    logger.error('Error occurred:', error.message);
  }
});

exports.verifyDealEnded = onSchedule("every day 00:20", ScheduleRuntimeOpts, async (event) => {
  try {
    logger.log('\n============================================= START RUNNING VERIFY VARIANTS DEAL ENDED =============================================');
   
    await VerifyDealRunning.verifyDealEnded();
    
    logger.log('\n============================================= FINISH RUNNING VERIFY VARIANTS DEAL ENDED =============================================');
  } catch (error) {
    logger.error('Error occurred:', error.message);
  }
});


// ================================================================================================================================== //
// /** Run a job every day, 0 0 represents midnight (12:00 AM) */
// exports.verifySaleOnVariantsStarted = CloudFunctions.pubsub.schedule('0 0 * * *').timeZone('Africa/Cairo')
// .onRun(async (context) => {
//   try {
//     logger.log('\n============================================= START RUNNING VERIFY VARIANTS SALE STARTED =============================================');
   
//     await VerifyVariantSale.verifySaleOnVariantsStarted();
    
//     logger.log('\n============================================= FINISH RUNNING VERIFY VARIANTS SALE STARTED =============================================');
//   } catch (error) {
//     logger.error('Error occurred:', error.message);
//   }
// });

// /** Run a job every day, 0 0 represents midnight (12:00 AM) */
// exports.verifySaleOnVariantsEnded = CloudFunctions.pubsub.schedule('0 0 * * *').timeZone('Africa/Cairo')
// .onRun(async (context) => {
//   try {
//     logger.log('\n============================================= START RUNNING VERIFY VARIANTS SALE ENDED =============================================');
   
//     await VerifyVariantSale.verifySaleOnVariantsEnded();
    
//     logger.log('\n============================================= FINISH RUNNING VERIFY VARIANTS SALE ENDED =============================================');
//   } catch (error) {
//     logger.error('Error occurred:', error.message);
//   }
// });


// const db = admin.firestore();
// // Get a reference to the collection
// const collectionRef = db.collection('auction');
// const query = db.collection('auction').where('startDate', '<=', CURRENT_DATE).where('status', '==', 'pending');
// // Get the documents
// query.get().then((snapshot) => {
//   snapshot.forEach((doc) => {
//     // Update each document
//     let docRef = collectionRef.doc(doc.id);
//     docRef.update({
//       yourFieldName: 'newValue'
//     }).then(() => {
//       console.log('Document updated successfully');
//     }).catch((error) => {
//       console.error('Error updating document: ', error);
//     });
//   });
// }).catch((error) => {
//   console.error('Error getting documents: ', error);
// });