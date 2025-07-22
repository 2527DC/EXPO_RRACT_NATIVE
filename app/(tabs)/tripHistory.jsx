// app/index.js (or HomeScreen.js)

import React from 'react';
import { View, Text, StyleSheet,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function TripHistory() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>This is the Trip Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
