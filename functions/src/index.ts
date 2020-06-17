import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFeedModule, getLocationFeedModule } from "./feedControl"
import { uploadPostModule } from "./uploadPost"
var serviceAccount = require('../xfeed-497fe-firebase-adminsdk-wjgq3-df2a207afc.json');
import { notificationHandlerModule, userArrivedLocation } from "./FCMApi"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://xfeed-497fe.firebaseio.com'
});

export const activityNotificationHandler = functions.firestore.document("/activities/{userId}/items/{activityFeedItem}")
    .onCreate(async (snapshot, context) => {
      await notificationHandlerModule(snapshot, context, 'activity');
    });

export const chatNotificationHandler = functions.firestore.document("/messages/{usersId}/items/{msgItem}")
    .onCreate(async (snapshot, context) => {
      await notificationHandlerModule(snapshot, context, 'chat');
    });

export const userArriveToLocation = functions.https.onRequest((req, res) => {
  userArrivedLocation(req, res);
})

export const getFeed = functions.https.onRequest((req, res) => {
  getFeedModule(req, res);
})

export const uploadPost = functions.https.onRequest((req, res) => {
  uploadPostModule(req, res);
})

export const getLocationFeed = functions.https.onRequest((req, res) => {
  getLocationFeedModule(req, res);
})
