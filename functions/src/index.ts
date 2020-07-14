import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFeedModule, getLocationFeedModule } from "./feedControl"
import { uploadPostModule } from "./uploadPost"
var serviceAccount = require('../xfeed-497fe-firebase-adminsdk-wjgq3-df2a207afc.json');
import { notificationHandlerModule, FCMService } from "./FCMApi"
import { deletePostModule } from './deletePost';
import { CreditMgr } from './CreditMgr';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://xfeed-497fe.firebaseio.com',
  storageBucket: 'gs://xfeed-497fe.appspot.com'
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
  FCMService.userArrivedLocation(req, res);
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

export const deletePost = functions.https.onRequest((req, res) => {
  deletePostModule(req, res);
})

/*---------------------------------------- only for test ------------------------------------------*/

// export const giveCreditToUser = functions.https.onRequest((req, res) => {
//   let rId = String(req.query.rId);
//   let sId = String(req.query.sId);
//   CreditMgr.giveCreditToUser(rId, sId);
//   res.status(200).send();
// })

