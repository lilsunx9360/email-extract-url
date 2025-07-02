


import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
 apiKey: "AIzaSyAz4nS_4tibz-QcsCLoKVDeXTzKNcgfcyY",
  authDomain: "email-extracter-7c08a.firebaseapp.com",
  projectId: "email-extracter-7c08a",
  storageBucket: "email-extracter-7c08a.firebasestorage.app",
  messagingSenderId: "775533755614",
  appId: "1:775533755614:web:49ead38b699ed9518dd64f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };