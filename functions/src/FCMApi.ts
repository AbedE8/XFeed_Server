import * as admin from 'firebase-admin';

export const notificationHandlerModule = async function (snapshot, context) {      
      console.log(snapshot.data())

      const ownerDoc = admin.firestore().doc("users/" + context.params.userId)
      const ownerData = await ownerDoc.get()

      const notificationToken = ownerData.data()["notification_token"];
      if (notificationToken) {
        sendNotification(notificationToken, snapshot.data());
      } else {
        console.log("No token for User, not sending a notification");
      }
      
      return 0;
    };

function sendNotification(iosNotificationToken: string, activityItem: FirebaseFirestore.DocumentData) {

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
  
    admin.messaging().sendToDevice(iosNotificationToken, message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
  }

/*var gcm = require('node-gcm');

export const FCMcontroller = {
	sendNotification: sendNotification
}

var sender = new gcm.Sender('AAAA65yPiaM:APA91bFHJjrU-kJbehpHFcWidPr7QEKHM-AE3Rph6UF1irHXGkJjkY3Mz1Zh8S5K0vaVfaSPLCVUoVcM1h2GZP_syKj_5KycZDZ_C8zKz1rbzUxUPzndJUGind6tPacIDglbL3VdQ82y');
// Prepare a message to be sent
var message = new gcm.Message({
	data: { key1: 'msg1' }
});

var regTokens = ['f-DKw_lcfUEGoaofMVPc0f:APA91bElq1buh136yORBixoKIIAX8pk3rkg1E3wILBz6sTHQqPHoTZPPdlq-tWZdwnOofBl3AXiM-mOkvNV5eQlvRB0regtqV2eSEl2qwY7IQ9Z1Izsic3j4LNWPpZaRip8MsXVXcP1U'];

function sendNotification() {
	sender.send(message, { registrationTokens: regTokens }, function (err, response) {
		if (err) console.error(err);
		else console.log(response);
	});
}*/