// import { useState, useEffect } from 'react';
// import * as Speech from 'expo-speech';
// import { Alert, Platform } from 'react-native';

// interface VoiceNotificationOptions {
//   enabled: boolean;
//   language?: string;
//   pitch?: number;
//   rate?: number;
// }

// export function useVoiceNotification() {
//   const [isEnabled, setIsEnabled] = useState(true);
//   const [isSpeaking, setIsSpeaking] = useState(false);

//   const defaultOptions: VoiceNotificationOptions = {
//     enabled: true,
//     language: 'en-US',
//     pitch: 1.0,
//     rate: 0.8,
//   };

//   const playVoiceNotification = async (message: string, options: Partial<VoiceNotificationOptions> = {}) => {
//     if (!isEnabled) return;

//     // Check if speech is available on the platform
//     if (Platform.OS === 'web') {
//       // For web, show alert as fallback
//       Alert.alert('Voice Notification', message);
//       return;
//     }

//     try {
//       setIsSpeaking(true);
      
//       const speechOptions = {
//         language: options.language || defaultOptions.language,
//         pitch: options.pitch || defaultOptions.pitch,
//         rate: options.rate || defaultOptions.rate,
//         onDone: () => setIsSpeaking(false),
//         onStopped: () => setIsSpeaking(false),
//         onError: () => {
//           setIsSpeaking(false);
//           console.error('Speech error occurred');
//         },
//       };

//       await Speech.speak(message, speechOptions);
//     } catch (error) {
//       setIsSpeaking(false);
//       console.error('Error playing voice notification:', error);
//       // Fallback to alert if speech fails
//       Alert.alert('Voice Notification', message);
//     }
//   };

//   const stopSpeaking = () => {
//     Speech.stop();
//     setIsSpeaking(false);
//   };

//   const notifyDriverAssigned = (driverName: string, time: string) => {
//     const message = `Your trip for ${time}, a driver ${driverName} has been assigned`;
//     playVoiceNotification(message);
//   };

//   const notifyDriverArriving = (estimatedTime: string) => {
//     const message = `Your driver will arrive in ${estimatedTime}`;
//     playVoiceNotification(message);
//   };

//   const notifyTripCancelled = (time: string) => {
//     const message = `Your trip for ${time} has been cancelled`;
//     playVoiceNotification(message);
//   };

//   const notifyTripConfirmed = (type: string, time: string, date: string) => {
//     const message = `Your ${type} trip for ${time} on ${date} has been confirmed`;
//     playVoiceNotification(message);
//   };

//   const playSampleNotification = () => {
//     const sampleMessage = "Your trip for 10:00 AM, a driver John Doe has been assigned";
//     playVoiceNotification(sampleMessage);
//   };

//   return {
//     isEnabled,
//     setIsEnabled,
//     isSpeaking,
//     playVoiceNotification,
//     stopSpeaking,
//     notifyDriverAssigned,
//     notifyDriverArriving,
//     notifyTripCancelled,
//     notifyTripConfirmed,
//     playSampleNotification,
//   };
// }