// import { useState, useEffect } from 'react';
// import * as Location from 'expo-location';
// import { Alert, Platform } from 'react-native';

// export function useLocationPermission() {
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
//   const [locationError, setLocationError] = useState<string | null>(null);

//   const requestLocationPermission = async () => {
//     try {
//       setLocationError(null);
      
//       // Check if location services are enabled
//       const isLocationEnabled = await Location.hasServicesEnabledAsync();
//       if (!isLocationEnabled) {
//         const errorMessage = 'Location services are disabled. Please enable location services in your device settings.';
//         setLocationError(errorMessage);
        
//         Alert.alert(
//           'Location Services Disabled',
//           'Location services are turned off. Please enable them in your device settings to use location features.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { 
//               text: 'Open Settings', 
//               onPress: () => {
//                 if (Platform.OS === 'ios') {
//                   Alert.alert('Settings', 'Go to Settings > Privacy & Security > Location Services');
//                 } else {
//                   Alert.alert('Settings', 'Go to Settings > Location and turn it on');
//                 }
//               }
//             }
//           ]
//         );
//         setHasPermission(false);
//         return false;
//       }

//       const { status } = await Location.requestForegroundPermissionsAsync();
//       setHasPermission(status === 'granted');
      
//       if (status === 'granted') {
//         try {
//           const location = await Location.getCurrentPositionAsync({
//             accuracy: Location.Accuracy.Balanced,
//             timeout: 10000,
//           });
//           setCurrentLocation(location);
//           return true;
//         } catch (locationError) {
//           console.warn('Could not get current location:', locationError);
//           // Set permission as granted but location as unavailable
//           setLocationError('Location is temporarily unavailable');
//           return true; // Still return true as permission is granted
//         }
//       } else {
//         Alert.alert(
//           'Location Permission Required',
//           'This app needs location access to track drivers and provide better service. Please enable location permissions in your device settings.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Try Again', onPress: () => requestLocationPermission() }
//           ]
//         );
//         return false;
//       }
//     } catch (error) {
//       console.error('Error requesting location permission:', error);
//       setLocationError('Failed to request location permission');
      
//       // Don't show alert for common location service errors
//       if (!error.message?.includes('location services')) {
//         Alert.alert('Error', 'Failed to request location permission. Please try again.');
//       }
      
//       setHasPermission(false);
//       return false;
//     }
//   };

//   const getCurrentLocation = async () => {
//     if (!hasPermission) {
//       const granted = await requestLocationPermission();
//       if (!granted) return null;
//     }

//     try {
//       setLocationError(null);
      
//       // Check if location services are still enabled
//       const isLocationEnabled = await Location.hasServicesEnabledAsync();
//       if (!isLocationEnabled) {
//         setLocationError('Location services are disabled');
//         return null;
//       }

//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//         timeout: 10000,
//       });
//       setCurrentLocation(location);
//       return location;
//     } catch (error) {
//       console.warn('Error getting current location:', error);
//       setLocationError('Location is temporarily unavailable');
//       return null;
//     }
//   };

//   const watchLocation = async (callback: (location: Location.LocationObject) => void) => {
//     if (!hasPermission) return null;

//     try {
//       const isLocationEnabled = await Location.hasServicesEnabledAsync();
//       if (!isLocationEnabled) {
//         setLocationError('Location services are disabled');
//         return null;
//       }

//       return Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.Balanced,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         callback
//       );
//     } catch (error) {
//       console.warn('Error watching location:', error);
//       setLocationError('Location tracking unavailable');
//       return null;
//     }
//   };

//   useEffect(() => {
//     // Don't automatically request permission on mount to avoid errors
//     // Let components request it when needed
//   }, []);

//   return {
//     hasPermission,
//     currentLocation,
//     locationError,
//     requestLocationPermission,
//     getCurrentLocation,
//     watchLocation,
//   };
// }