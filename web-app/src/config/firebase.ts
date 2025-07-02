import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  // You'll need to get these from your Firebase Console
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Connect to emulator if in development (disabled for now - using production auth)
// if (import.meta.env.DEV && !auth.emulatorConfig) {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//   } catch (error) {
//     // Emulator already connected or not available
//     console.log('Auth emulator connection skipped:', error);
//   }
// }

export const googleProvider = new GoogleAuthProvider();

// Configure Google provider to get additional user info
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
}); 