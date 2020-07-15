import * as admin from 'firebase-admin';
import { CreditMgr } from './CreditMgr';
import { DBController } from './DBApi';

export const notificationHandlerModule = async function (snapshot, context, type) {  
  let notificationToken;
  if (snapshot!= null) {   
    console.log(snapshot.data());
  }
  
  notificationToken = await getNotificationToken(snapshot, context, type);
  if(!notificationToken){
    console.log("cant get notification token");
    return -1;
  }

  switch (type) {
    case 'activity':
      sendActivityNotification(notificationToken, snapshot.data());
      break;
    
    case 'chat':
      sendChatNotification(notificationToken, snapshot.data());
      break;

    default:
      console.log(type + "not supported");
      break;
    }
  return 0;
};

function sendActivityNotification(notificationToken: string, activityItem: FirebaseFirestore.DocumentData) {

    let title: string;
    let body: string = "";
  
    if (activityItem['type'] === "comment") {
      title = "New Comment"
      body = activityItem['username'] + " commented on your post: " + activityItem["commentData"]
    } else if (activityItem["type"] === "like") {
      title = activityItem['username'] + " liked your post"
    } else if (activityItem["type"] === "follow"){
      title = activityItem['username'] + " started following you"
    }

    var message = {
        notification: {
          title: title,
          body: body,
          click_action:"FCM_PLUGIN_ACTIVITY",
          sound: 'default',
          badge: '1',
          priority: "high",
        }
      };
      
      sendNotification(notificationToken, message);
}

function sendChatNotification(notificationToken: string, chatItem: FirebaseFirestore.DocumentData) {
  let title: string;
  let body: string = "";

  title = "you have new message"
  body = chatItem['fromUserName'] + " send you a message"

  var message = {
      notification: {
        title: title,
        body: body,
        click_action:"FCM_PLUGIN_ACTIVITY",
        sound: 'default',
        badge: '1',
        priority: "high",
      }
    };
    
    sendNotification(notificationToken, message);
}

function sendArrivedNotification(notificationToken: string) {
  let title: string;
  let body: string = "";

  title = "we happy you arrived safe to the location."
  body = "arrived"

  var message = {
      notification: {
        title: title,
        body: body,
        click_action:"FCM_PLUGIN_ACTIVITY",
        sound: 'default',
        badge: '1',
        priority: "high",
      }
    };
    
  sendNotification(notificationToken, message);
}

function sendNotification(notificationToken, message){
  admin.messaging().sendToDevice(notificationToken, message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
}

async function getNotificationToken(snapshot, context, type){
  let ownerDoc;
  let ownerData;
  
  switch (type) {
    case 'activity':
      ownerDoc = admin.firestore().doc("users/" + context.params.userId);
      break;
    
    case 'chat':
      ownerDoc = admin.firestore().doc("users/" + snapshot.data()['idTo']);
      break;

    case 'arrivedLocation':
      let userId = String(snapshot.body.userId);
      console.log(userId);
      ownerDoc = admin.firestore().doc("users/" + userId);
      break;
    
    case 'toCredit':
      ownerDoc = admin.firestore().doc("users/" + snapshot);
      break;
    
    default:
      break;
  }
  ownerData = await ownerDoc.get();

  return ownerData.data()["notification_token"];
}

async function sendNotificationCreditInc(UidToSend, UidSendBy){
  let title: string;
  let body: string = "";
  let UserNameSendBy = await DBController.getDocByUid(UidSendBy, 'users').then(userRef => {
    return userRef.data().username;
  });
  getNotificationToken(UidToSend, null, 'toCredit').then(notificationToken => {
    console.log(notificationToken);
    /* TODO: be able to show the post.*/
    title = "You earn a new credit";
    body = UserNameSendBy + " is arrived to location from your post.";
  
    var message = {
        notification: {
          title: title,
          body: body,
          click_action:"FCM_PLUGIN_ACTIVITY",
          sound: 'default',
          badge: '1',
          priority: "high",
        }
      };
  
    sendNotification(notificationToken, message);
  }).catch();
}

const userArrivedLocation = function(req, res) {
  async function run() {
    const publisherId = String(req.body.publisherId);
    const userId = String(req.body.userId);
    
    if (publisherId != userId) {
      CreditMgr.giveCreditToUser(publisherId, userId).then().catch();
    }

    await getNotificationToken(req, null, 'arrivedLocation').then((notificationToken) => {
      if(!notificationToken){
        console.log("cant get notification token");
        res.status(200).send();
      }
      sendArrivedNotification(notificationToken);
    });

    res.status(200).send();
  }

  run().then().catch();;
}

async function sendNotificationLevelUp(Uid, newLevel, newDist){
  let title: string;
  let body: string = "";

  getNotificationToken(Uid, null, 'toCredit').then(notificationToken => {
    console.log(notificationToken);
    title = "Congratulations! Your level was upgrade";
    body = "you have been promoted to " + newLevel + " level, from now your distribution will be " + newDist;
  
    var message = {
        notification: {
          title: title,
          body: body,
          click_action:"FCM_PLUGIN_ACTIVITY",
          sound: 'default',
          badge: '1',
          priority: "high",
        }
      };
  
    sendNotification(notificationToken, message);
  }).catch();
}

export const FCMService = {
  sendNotificationCreditInc: sendNotificationCreditInc,
  userArrivedLocation: userArrivedLocation,
  sendNotificationLevelUp: sendNotificationLevelUp
}
