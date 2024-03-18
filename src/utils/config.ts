import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBMicKgTKBrmQAD_V3Oww8HDFWLJTxuZv4",
    authDomain: "towership-e9ea9.firebaseapp.com",
    projectId: "towership-e9ea9",
    storageBucket: "towership-e9ea9.appspot.com",
    messagingSenderId: "205251437136",
    appId: "1:205251437136:web:2bf63ac6539efe465fe755"
};

// Inicijalizacija Firebasec
export const app = initializeApp(firebaseConfig);
export const db = getDatabase()
