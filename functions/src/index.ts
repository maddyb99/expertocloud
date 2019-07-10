import * as functions from 'firebase-functions';
const {Storage} = require('@google-cloud/storage');
//import * as admin from 'firebase-admin'
const admin= require('firebase-admin');
admin.initializeApp();
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const addUserData = functions.https.onCall((data,context)=>
{
    let docID=String;
    docID=data["docID"];
    const users = admin.firestore().doc('Users/'+docID);
    //data.delete("docID");
    return users.set(data);
}
)

export const onUserDelete =functions.auth.user().onDelete((user,context)=>{
    const googleCloudStorage=new Storage();
    const bucket = googleCloudStorage.bucket('gs://experto-b99b2.appspot.com');
    let filePath = `Profile Photos/${user.uid}`;
    let file = bucket.file(filePath);
    if (file){
    file.delete().then(() => {
        console.log(`Successfully deleted photo with UID: ${user.uid}`)
    });}
    filePath = `Profile Photos/thumbs/${user.uid}`;
    file = bucket.file(filePath);
    if(file){
    file.delete().then(() => {
        console.log(`Successfully deleted photo with UID: ${user.uid}`)
    });}
    return admin.firestore().doc('Users/'+user.uid).delete;
})

export const onInteraction = functions.firestore.document('Interactions/{doc}').onCreate((snap,context)=>{
    const newValue = snap.data();
    console.log(newValue);
    let val;
    if(newValue){
        const user = admin.firestore().doc('Users/'+newValue.user);
        const expert = admin.firestore().doc('Experts/'+newValue.expert);
        const interactions=admin.firestore().collection("Interactions").get();
        interactions.then(function(q: any){
            console.log(q);
            val= snap.ref.set({
                interactionTime: admin.firestore.FieldValue.arrayUnion(admin.firestore.Timestamp.now()),
                id: q.size-1,
            },{merge: true}).then(function(){
                console.log("done");
                user.update({
                    interactionID: admin.firestore.FieldValue.arrayUnion(q.size-1)
                });
                expert.update({
                    interactionID: admin.firestore.FieldValue.arrayUnion(q.size-1)
                });
            });
        })
        
    }
    return val;
})