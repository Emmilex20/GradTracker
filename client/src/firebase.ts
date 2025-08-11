import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCX2B7vcjvOxnN4BbAzSbBNNwLFKt8Fjj4",
  authDomain: "grad-tracker-app.firebaseapp.com",
  projectId: "grad-tracker-app",
  storageBucket: "grad-tracker-app.firebasestorage.app",
  messagingSenderId: "533399239376",
  appId: "1:533399239376:web:55f4e35c20a1624f73fcd5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);