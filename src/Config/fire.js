import * as firebase from 'firebase/app';
import "firebase/auth";

// Your web app's Firebase configuration
const app = firebase.initializeApp({
    apiKey: "AIzaSyBgASxfCSaGLqpzYp-nEyVlWuWAF-i2K4A",
    authDomain: "easy-sync-4u.firebaseapp.com",
    databaseURL: "https://easy-sync-4u.firebaseio.com",
    projectId: "easy-sync-4u",
    storageBucket: "easy-sync-4u.appspot.com",
    messagingSenderId: "176907511380",
    appId: "1:176907511380:web:3cd76fb68e284275d4efc1",
    measurementId: "G-ZCRTLRH9Z8"
});
// Initialize Firebase

export default app;