import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api_client from '../api/API_CIENT';


const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (emailOrPhone, password) => {
    try {
      setIsLoading(true);
  
      const formData = new URLSearchParams();
      formData.append('username', emailOrPhone);
      formData.append('password', password);
      formData.append('device_uuid', 'test-device-uuid-1231aqs');
      formData.append('device_name', 'Samsung A501');
      formData.append('fcm_token', 'test-fcm-token-123');
      formData.append('grant_type', 'password');
      formData.append('client_id', 'dummy-client-id');
      formData.append('client_secret', 'dummy-client-secret');
      formData.append('force_logout', 'true');
  
      const response = await api_client.post(  '/employees/auth/employee/login',formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      const {
        access_token,
        token_type,
        employee_id,
        employee_code,
        username,
        department_id,
        department_name,
      } = response.data;
  
      const userData = {
        employee_id,
        employee_code,
        username,
        department_id,
        department_name,
      };
  
      // Store token & user info
      await AsyncStorage.setItem('authToken', access_token);
      await AsyncStorage.setItem('tokenType', token_type);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
  
      setUser(userData);
  
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  


  const forgotPassword = async (emailOrPhone) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success - in real app, this would send reset email/SMS
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}