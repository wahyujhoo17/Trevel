import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  TwitterAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { Analytics, getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with popup redirect resolver
export const auth = getAuth(app);

// Set persistence only on client side
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence);
}

// Configure providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const twitterProvider = new TwitterAuthProvider();

// Initialize Analytics only on client side
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };
