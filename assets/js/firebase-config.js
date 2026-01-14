// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyDkP3QfwMnEutlSLc5NCuIybmpXMdVxJPk",
  authDomain: "mahmoodmasjid-7b0dc.firebaseapp.com",
  projectId: "mahmoodmasjid-7b0dc",
  storageBucket: "mahmoodmasjid-7b0dc.firebasestorage.app",
  messagingSenderId: "292543375797",
  appId: "1:292543375797:web:9f6d8d6d4dbba8fc6151fc",
  measurementId: "G-73693W1107"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
