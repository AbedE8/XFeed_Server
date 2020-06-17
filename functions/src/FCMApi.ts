import * as admin from 'firebase-admin';

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
      const userId = String(snapshot.body.userId);
      console.log(userId);
      ownerDoc = admin.firestore().doc("users/" + userId);
      break;
    
    default:
      break;
  }
  ownerData = await ownerDoc.get();

  return ownerData.data()["notification_token"];
}

export const userArrivedLocation = function(req, res) {
  async function run() {
    console.log(req.body);
    
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