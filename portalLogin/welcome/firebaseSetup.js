import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.firebasestorage.app",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
  };
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function testFirestoreConnection() {
  try {
    const snapshot = await db.collection('users').get();
    console.log('Successfully connected to Firestore');
    console.log(`Number of documents in 'users' collection: ${snapshot.size}`);
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    if (error.code === 'permission-denied') {
      console.error('This error may be due to insufficient permissions. Please check your Firebase Security Rules and make sure your service account has the necessary permissions.');
    }
  }
}

testFirestoreConnection();

console.log('Firebase initialization and test complete.');