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
    const time=admin.firestore.Timestamp.now();
    let val;
    if(newValue){
        const user = admin.firestore().doc('Users/'+newValue.user);
        const expert = admin.firestore().doc('Experts/'+newValue.expert);
        const interactions=admin.firestore().collection("Interactions").where('user','==',newValue.user).where('expert','==',newValue.expert).get();
        interactions.then(function(q:any){
            if(q.size>1)
            {
                console.log("Already exists");
                q.forEach(function(element: any) {
                    if(element.id!==snap.id)
                        element.ref.set({
                            interactionTime: admin.firestore.FieldValue.arrayUnion(time)
                        },{merge:true});
                });
                val=snap.ref.delete();
                console.log("done");
            }
            else
            {
                console.log("doesnt exist");
                const interactions2=admin.firestore().collection("Interactions").get();
                interactions2.then(function(qu: any){
                    console.log(qu);
                    val= snap.ref.set({
                        interactionTime: admin.firestore.FieldValue.arrayUnion(time),
                        id: qu.size-1,
                    },{merge: true}).then(function(){
                        user.update({
                            interactionID: admin.firestore.FieldValue.arrayUnion(qu.size-1)
                        });
                        expert.update({
                            interactionID: admin.firestore.FieldValue.arrayUnion(qu.size-1)
                        });
                    });
                });
                console.log("done");
            }
        });
        
        
    }
    return val;
})
