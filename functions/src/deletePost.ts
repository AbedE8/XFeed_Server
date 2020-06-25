import * as admin from 'firebase-admin';
import { DBController } from "./DBApi"

export const deletePostModule = function(req, res) {
    let postId = String(req.query.postId);

    async function execDeletePost() {
        var postToDelete = await DBController.getDocByUid(postId, "posts");
        console.log(postToDelete.data().feature_name);
        
        let GeoLocationDB = await admin.firestore().collection("geoLocation").where("d.name", "==", postToDelete.data().feature_name);
        await GeoLocationDB.get().then(async function(geolocationSnapshot){
            var posts = geolocationSnapshot.docs[0].data().d.posts;
            
            /* we have in this location more than one post*/
            if (geolocationSnapshot.docs[0].data().d.posts.length > 1){
                await geolocationSnapshot.docs[0].ref.update({d:{posts: posts.filter(post => post.id !== postId),
                    coordinates: geolocationSnapshot.docs[0].data().d.coordinates,
                    name: geolocationSnapshot.docs[0].data().d.name}});
            } else {
                geolocationSnapshot.docs[0].ref.delete().catch(err => console.log(err));
            }
            
            DBController.deleteImgFromStorage(postToDelete.data().img_url).catch(err => console.log(err));
            DBController.deletePostFromActivity(postToDelete.data().publisher, postId).catch(err => console.log(err));
            DBController.deleteDoc(postId, "posts").catch(err => console.log(err));
        });
        
        res.status(200).send();
    }
    
	execDeletePost().then().catch();
}