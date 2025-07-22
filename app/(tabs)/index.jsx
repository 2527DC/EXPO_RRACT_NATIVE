import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, Image } from 'react-native';

export default function ProfileScreen() {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const toggleSwitch = () => setIsNotificationEnabled(previousState => !previousState);

  const userData = {
    name: 'Chethan',
    employeeId: 'EMP-2048',
    email: 'chethan.employee@company.com',
    phone: '+1 (555) 123-4567',
    office: 'San Francisco HQ, Floor 5, Desk 12A'
  };

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('User logged out');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.employeeId}>{userData.employeeId}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{userData.email}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{userData.phone}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Office</Text>
          <Text style={styles.detailValue}>{userData.office}</Text>
        </View>

        <View style={[styles.detailItem, styles.notificationItem]}>
          <Text style={styles.detailLabel}>Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={isNotificationEnabled ? "#f4f3f4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isNotificationEnabled}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  employeeId: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  notificationItem: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});