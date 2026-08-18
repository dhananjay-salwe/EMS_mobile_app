import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { apiCall } from '../api/client';
import Button from '../components/Button';
import { COLORS, RADIUS, SPACING, FONTS, SHADOW } from '../theme';

export default function LoginScreen({ onLoginSuccess }) {
// ✅ Empty initial values:
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    const data = await apiCall('/auth/login', 'POST', { username, password });
    setLoading(false);

    if (data.success) {
      onLoginSuccess(data.operator);
    } else {
      Alert.alert('Login Failed', data.message || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>Welcome to EMS</Text>
              <Text style={styles.bannerSubtitle}>Authorized Booth Officer Login</Text>
            </View>

            {/* <View style={styles.logo}>
              <Text style={styles.logoText}>⚡</Text>
            </View> */}
            <View style={styles.logo}>
              <Image
                source={require('../../assets/android/ic_launcher-web.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#adb2bc"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#adb2bc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                title={loading ? 'Authenticating…' : 'Login'}
                onPress={handleLogin}
                loading={loading}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bodyBg },
  scroll: { 
  flexGrow: 1, 
  justifyContent: 'center', 
  padding: SPACING.md,
  paddingBottom: 80 
},
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOW,
  },
  banner: {
    backgroundColor: COLORS.primary,
    paddingTop: 26,
    paddingBottom: 46,
    paddingHorizontal: 26,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -32,
    ...SHADOW,
  },
  // logoText: { fontSize: 26 },
  logoImage: {
  width: 46,
  height: 46,
},
  form: { padding: 26, paddingTop: 22 },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: FONTS.semibold,
    color: COLORS.textBody,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14.5,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
});