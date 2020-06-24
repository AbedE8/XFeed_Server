import * as admin from 'firebase-admin';

export const DBController = {
	insertDocumentToCollection: insertDocumentToCollection,
	getDocByUid: getDocByUid,
	incrementDocField: incrementDocField,
	deleteDoc: deleteDoc,
	deleteImgFromStorage: deleteImgFromStorage,
	deletePostFromActivity: deletePostFromActivity
}

async function insertDocumentToCollection(collectionName, documentToAdd, msg){
	return await admin.firestore().collection(collectionName).add(documentToAdd)
	.then(ref => {
		console.log(msg);
		return ref;})
	.catch((err) => {
		console.log(err);
		return null;
	});
}

async function getDocByUid(uid, collectionName) {
	return await admin.firestore().collection(collectionName).doc(uid).get();
}

function incrementDocField(collectionName, docId, field, amount){
	const increment = admin.firestore.FieldValue.increment(amount);
	let obj = {};
	obj[field] = increment;
	admin.firestore().collection(collectionName).doc(docId).update(obj).then().catch(err => {console.log(err);});

}

async function deleteDoc(id, collectionName){
	await admin.firestore().collection(collectionName).doc(id).delete().catch(err => console.log(err));
}

async function deleteImgFromStorage(img_url){
	const imgRef = admin.storage().bucket().file(getImgNameFromUrl(img_url));
	imgRef.delete().catch(err => console.log(err));
}

function getImgNameFromUrl(img_url: String) {
    var splittes = img_url.split("/");
    splittes = splittes[splittes.length -1].split("?");
    return splittes[0];
}

async function deletePostFromActivity(uid, postToDeleteId){
	admin.firestore().collection("activities").doc(uid).listCollections().then(collections => {
		collections.forEach(collection => {
			if (collection.id == "items"){
				collection.get().then(snapshot => {
					snapshot.forEach(doc => {	
						if(doc.data().postId == postToDeleteId){
							collection.doc(doc.id).delete().catch(err => console.log(err));
						}
					});
				}).catch(err => console.log(err));
			}
		});
	}).catch(err => console.log(err));
}
