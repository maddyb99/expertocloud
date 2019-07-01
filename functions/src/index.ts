import * as functions from 'firebase-functions';
//import * as admin from 'firebase-admin'
const admin= require('firebase-admin');
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
 console.log("hey");
    response.send("Hello from this is maddy!");
});

export const addUserData = functions.https.onCall((data,context)=>
{
    admin.initializeApp();
    let docID=String;
    docID=data["docID"];
    const users = admin.firestore().doc('Users/'+docID);
    console.log(docID);
    //data.delete("docID");
    return users.set(data);
}
)