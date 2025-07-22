import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Mail, Phone, ArrowLeft, Send } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';


export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [resetType, setResetType] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Error', `Please enter your ${resetType}`);
      return;
    }

    setIsLoading(true);
    const success = await forgotPassword(emailOrPhone);
    setIsLoading(false);
    
    if (success) {
      Alert.alert(
        'Reset Link Sent',
        `Password reset instructions have been sent to your ${resetType}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to send reset instructions. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.title}>Forgot Password</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            <Text style={styles.description}>
              Enter your {resetType} address and we'll send you instructions to reset your password.
            </Text>

            {/* Reset Type Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  resetType === 'email' && styles.activeToggle
                ]}
                onPress={() => setResetType('email')}
              >
                <Mail size={16} color={resetType === 'email' ? '#ffffff' : '#6b7280'} />
                <Text style={[
                  styles.toggleText,
                  resetType === 'email' && styles.activeToggleText
                ]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  resetType === 'phone' && styles.activeToggle
                ]}
                onPress={() => setResetType('phone')}
              >
                <Phone size={16} color={resetType === 'phone' ? '#ffffff' : '#6b7280'} />
                <Text style={[
                  styles.toggleText,
                  resetType === 'phone' && styles.activeToggleText
                ]}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email/Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                {resetType === 'email' ? (
                  <Mail size={20} color="#6b7280" />
                ) : (
                  <Phone size={20} color="#6b7280" />
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder={resetType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType={resetType === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Send Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.disabledButton]}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Send size={20} color="#ffffff" />
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Text>
            </TouchableOpacity>

            {/* Demo Info */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Demo Mode:</Text>
              <Text style={styles.demoText}>
                Any email or phone number will work in demo mode
              </Text>
            </View>
          </View>

          {/* Back to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeToggle: {
    backgroundColor: '#2563eb',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeToggleText: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
  },
  resetButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: '#3730a3',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});