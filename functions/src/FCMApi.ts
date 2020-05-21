var gcm = require('node-gcm');

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
}


