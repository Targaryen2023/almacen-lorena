import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log("API KEY:", process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
console.log("PROJECT:", process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);



const firebaseConfig = {

  apiKey: "AIzaSyAJYrAkDfJMm2tfPNdhsuRxXgYlu4zaxUI",

  authDomain: "ejemplo-96666.firebaseapp.com",

  projectId: "ejemplo-96666",

  storageBucket: "ejemplo-96666.firebasestorage.app",

  messagingSenderId: "439585359564",

  appId: "1:439585359564:web:e43eafd126c383ec05e469"

};


export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let auth = null;
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  try {
    // auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    auth = Platform.OS === 'web' ? getAuth(app) : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    if (error.code !== 'auth/already-initialized') throw error;
    auth = getAuth(app);
  }
}

export { auth };
