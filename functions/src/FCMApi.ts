import * as admin from 'firebase-admin';

export const notificationHandlerModule = async function (snapshot, context, type) {      
      console.log(snapshot.data())
      let ownerDoc;
      let ownerData;
      let notificationToken;

      switch (type) {
        case 'activity':
          ownerDoc = admin.firestore().doc("users/" + context.params.userId)
          ownerData = await ownerDoc.get()
          notificationToken = ownerData.data()["notification_token"];
          if(notificationToken) {
            sendActivityNotification(notificationToken, snapshot.data());
          }
          else {
            console.log("No token for User, not sending a notification");
          }
          break;
        
        case 'chat':
          ownerDoc = admin.firestore().doc("users/" + snapshot.data()['idTo'])
          ownerData = await ownerDoc.get()
          notificationToken = ownerData.data()["notification_token"];
          
          if(notificationToken) {
            sendChatNotification(notificationToken, snapshot.data());
          }
          else {
            console.log("No token for User, not sending a notification");
          }
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