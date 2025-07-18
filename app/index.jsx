import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firebaseApp from '../utils/firebaseConfig';
import { getApps } from 'firebase/app';

export default function IndexScreen() {
  useEffect(() => {
    // Check if Firebase is initialized
    if (getApps().length) {
      console.log('✅ Firebase initialized:', firebaseApp.name);
    } else {
      console.warn('⚠️ Firebase not initialized!');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Checking Firebase...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
});
