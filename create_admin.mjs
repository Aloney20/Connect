import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDhoE5ahE7wJehQmvsHpKeO-YB4nxFJwqQ",
  authDomain: "test-mark-system.firebaseapp.com",
  projectId: "test-mark-system",
  storageBucket: "test-mark-system.firebasestorage.app",
  messagingSenderId: "165953645762",
  appId: "1:165953645762:web:fbc5e4633af117acf91f5b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = 'admin@college.edu';
const password = 'AdminPassword123!';

console.log('Attempting to create Firebase Admin User...');

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log('SUCCESS! Admin user created in Firebase Authentication.');
    console.log('User UID:', userCredential.user.uid);
    console.log('Email:', userCredential.user.email);
    console.log('Password:', password);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error creating user:', error.code, error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists in Firebase!');
    }
    process.exit(1);
  });
