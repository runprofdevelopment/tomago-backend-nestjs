const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ProductAlgoliaService = require('../product/algoliaService');
const Review = new (require('../../database/models/review'));

module.exports = class UpdateTotalRating {
  static async execute(entityName, entityId) {
    console.log('STARTED = ', { entityName, entityId });
    const admin = require('firebase-admin');
    const collectionPath = `${entityName}/${entityId}/${Review.collectionName}`

    // [1] Find all reviews on entity name 
    const reviews = FirebaseHelper.mapCollection(
      await admin.firestore().collection(collectionPath).where('rating', '!=', null).orderBy('rating').get()
    )
    console.log(`[1] Find all reviews on ${entityName}...`);

    // [2] Calculate the ratings of this entity after changes
    const ratings = reviews.map(review => review.rating)
    const sumOfRatings = ratings.reduce((previousValue, currentValue) => { 
      return parseFloat(previousValue) + parseFloat(currentValue)
    })
    const totalRatings = Number((sumOfRatings / ratings.length).toFixed(1)) 
    const ratingDetails = {
      1: ratings.filter(rating => Math.round(rating) === 1).length,
      2: ratings.filter(rating => Math.round(rating) === 2).length,
      3: ratings.filter(rating => Math.round(rating) === 3).length,
      4: ratings.filter(rating => Math.round(rating) === 4).length,
      5: ratings.filter(rating => Math.round(rating) === 5).length,
    }
    console.log('Ratings = ', ratings);
    console.log('totalRating = ', sumOfRatings);
    console.log(`[2] Calculate the rating of this ${entityName} after changes ==> [${entityName} total rating = `, totalRatings, ']');

    // [3] Get the total count of the reviewed
    const reviewsCount = await this.getTotalCountOfReviewed(collectionPath);

    // [4] Update entity with rating in database
    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`${entityName}/${entityId}`),
      {
        rating: totalRatings,
        rating_details: ratingDetails,
        reviews_count: reviewsCount,
      },
    );
    console.log(`[4] Update ${entityName} rating in database successfully...`);

    // [5] Update rating in algolia variants
    await ProductAlgoliaService.updateProductWithAllVariants(entityId, {
      rating: totalRatings,
      rating_details: ratingDetails,
      reviews_count: reviewsCount,
    });
    console.log(`[5] Update ${entityName} rating in algolia successfully...`);

    // if (entityName === 'product') {
    //   const AlgoliaService = require('../../infrastructure/algolia/algoliaSearch');
    //   this.algoliaService = new AlgoliaService();
    //   this.algoliaService.initIndex('prod_PRODUCTS');
    //   await this.algoliaService.updateObject(entityId, {
    //     rating: totalRatings,
    //     ratingDetails: ratingDetails,
    //     reviews_count: reviews_count,
    //   })
    //   console.log(`[5] Update ${entityName} rating in algolia successfully...`);
    // }
  }

  static async getTotalCountOfReviewed(collectionPath) {
    const snapshot = await admin.firestore().collection(collectionPath).count().get();
    return snapshot.data().count;
  } 
};