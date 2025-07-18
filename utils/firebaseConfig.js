// firebaseConfig.js
import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';

let firebaseConfig;

if (Platform.OS === 'ios') {
  firebaseConfig = {
    apiKey: "AIzaSyBklDHnFfOLFrPG85YIgNWGQ-9hz6yzQyg",
    authDomain: "ets-1-ccb71.firebaseapp.com",
    projectId: "ets-1-ccb71",
    storageBucket: "ets-1-ccb71.appspot.com",
    messagingSenderId: "570547490090",
    appId: "1:570547490090:ios:874427e2e17787e1246253",
  };
} else {
  firebaseConfig = {
    apiKey: "AIzaSyClvrfGUYdqPYWAXroCgqMXrX3GFIh17mQ",
    authDomain: "ets-1-ccb71.firebaseapp.com",
    projectId: "ets-1-ccb71",
    storageBucket: "ets-1-ccb71.appspot.com",
    messagingSenderId: "570547490090",
    appId: "1:570547490090:android:e96eace798b769d4246253",
  };
}

let firebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  console.log('✅ Firebase Initialized');
} else {
  firebaseApp = getApp();
  console.log('ℹ️ Firebase Already Initialized');
}

export default firebaseApp;
