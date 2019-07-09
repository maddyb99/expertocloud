import * as functions from 'firebase-functions';
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
    console.log(docID);
    //data.delete("docID");
    return users.set(data);
}
)

export const onUserDelete =functions.auth.user().onDelete((user,context)=>{
    return admin.firestore().doc('Users/'+user.uid).delete;
})