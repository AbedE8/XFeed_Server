import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFeedModule, getLocationFeedModule } from "./feedControl"
import { uploadPostModule } from "./uploadPost"
var serviceAccount = require('../xfeed-497fe-firebase-adminsdk-wjgq3-df2a207afc.json');
import { notificationHandlerModule } from "./FCMApi"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://xfeed-497fe.firebaseio.com'
});

export const notificationHandler = functions.firestore.document("/insta_a_feed/{userId}/items/{activityFeedItem}")
    .onCreate(async (snapshot, context) => {
      await notificationHandlerModule(snapshot, context);
    });

export const getFeed = functions.https.onRequest((req, res) => {
  getFeedModule(req, res);
})

export const uploadPost = functions.https.onRequest((req, res) => {
  uploadPostModule(req, res);
})

export const getLocationFeed = functions.https.onRequest((req, res) => {
  getLocationFeedModule(req, res);
})

/*export const updateCollection = functions.https.onRequest((req, res) => {
  admin.firestore().collection(collection_name).get().then(postsRef => {
    postsRef.forEach(post => {
      post.ref.update({field: value});
    })
    res.status(200).send();
  })
})*/


