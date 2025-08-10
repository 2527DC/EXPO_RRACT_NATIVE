import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [userData, setUserData] = useState(null);

  const toggleSwitch = () => setIsNotificationEnabled(prev => !prev);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Your account information</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.userInfo}>
          <View style={styles.userInitials}>
            <Text style={styles.initialsText}>
              {userData.username.split(' ').map(name => name[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{userData.username}</Text>
            <Text style={styles.userEmail}>
              {userData.username.toLowerCase().replace(' ', '.')}@company.com
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <DetailItem 
            icon="badge" 
            label="Employee ID" 
            value={userData.employee_id.toString()} 
          />
          <DetailItem 
            icon="fingerprint" 
            label="Employee Code" 
            value={userData.employee_code} 
          />
          <DetailItem 
            icon="business" 
            label="Department" 
            value={userData.department_name} 
          />
          <DetailItem 
            icon="notifications" 
            label="Notifications"
            isSwitch={true}
            switchValue={isNotificationEnabled}
            onSwitchChange={toggleSwitch}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#e74c3c" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function DetailItem({ icon, label, value, isSwitch, switchValue, onSwitchChange }) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailLeft}>
        <MaterialIcons name={icon} size={20} color="#7f8c8d" style={styles.detailIcon} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          trackColor={{ false: "#e0e0e0", true: "#4CAF50" }}
          thumbColor="#fff"
          ios_backgroundColor="#e0e0e0"
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <Text style={styles.detailValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    marginBottom: 24,
    paddingTop: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInitials: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initialsText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});