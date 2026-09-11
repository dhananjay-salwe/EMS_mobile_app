import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { apiCall, setAuthToken } from '../api/client';

// --- Pure React Native Vector Icons (Zero Font Dependencies, Crash-Proof) ---

const LockIcon = ({ size = 13, color = '#444653' }) => (
  <View style={{ width: size, height: size + 3, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.6,
        borderWidth: 1.6,
        borderColor: color,
        borderTopLeftRadius: size * 0.36,
        borderTopRightRadius: size * 0.36,
        borderBottomWidth: 0,
        marginBottom: -1,
      }}
    />
    <View
      style={{
        width: size,
        height: size * 0.65,
        backgroundColor: color,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 1.5, height: 2.5, backgroundColor: '#ffffff', borderRadius: 1 }} />
    </View>
  </View>
);

const BadgeIcon = ({ color = '#757684' }) => (
  <View
    style={{
      width: 17,
      height: 13,
      borderWidth: 1.5,
      borderColor: color,
      borderRadius: 2.5,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <View style={{ width: 5, height: 2.5, backgroundColor: color, borderRadius: 1, marginBottom: 1.5 }} />
    <View style={{ width: 9, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

const PersonIcon = ({ color = '#c4c5d5' }) => (
  <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 6.5, height: 6.5, borderRadius: 3.5, backgroundColor: color, marginBottom: 1.5 }} />
    <View
      style={{
        width: 13,
        height: 6,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        backgroundColor: color,
      }}
    />
  </View>
);

const KeyIcon = ({ color = '#444653' }) => (
  <View style={{ width: 15, height: 15, flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.5, borderColor: color }} />
    <View style={{ width: 7, height: 2, backgroundColor: color, marginLeft: -1 }}>
      <View style={{ width: 1.8, height: 2.5, backgroundColor: color, position: 'absolute', right: 1, top: 1.8 }} />
    </View>
  </View>
);

const EyeIcon = ({ visible, color = '#757684' }) => (
  <View style={{ width: 22, height: 16, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 19,
        height: 11,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 5.5,
          height: 5.5,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
    </View>
    {!visible && (
      <View
        style={{
          position: 'absolute',
          width: 18,
          height: 1.8,
          backgroundColor: color,
          transform: [{ rotate: '-40deg' }],
        }}
      />
    )}
  </View>
);

const ShieldCheckIcon = () => (
  <View
    style={{
      width: 19,
      height: 22,
      borderWidth: 1.8,
      borderColor: '#1e40af',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 9,
      borderBottomRightRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
    }}
  >
    <Text style={{ fontSize: 11, fontWeight: '900', color: '#1e40af', marginTop: -2 }}>✓</Text>
  </View>
);

const ArrowRightIcon = () => (
  <View style={{ width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 10, height: 2, backgroundColor: '#ffffff' }} />
    <View
      style={{
        position: 'absolute',
        right: 1,
        width: 6,
        height: 6,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: '#ffffff',
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

const SupportIcon = ({ color = '#1e40af' }) => (
  <View style={{ width: 17, height: 17, alignItems: 'center' }}>
    <View
      style={{
        width: 13,
        height: 10,
        borderWidth: 1.6,
        borderColor: color,
        borderTopLeftRadius: 6.5,
        borderTopRightRadius: 6.5,
        borderBottomWidth: 0,
      }}
    />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 15, marginTop: -2 }}>
      <View style={{ width: 3, height: 5, backgroundColor: color, borderRadius: 1.5 }} />
      <View style={{ width: 3, height: 5, backgroundColor: color, borderRadius: 1.5 }} />
    </View>
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 2,
        width: 6,
        height: 3,
        borderBottomWidth: 1.5,
        borderLeftWidth: 1.5,
        borderColor: color,
      }}
    />
  </View>
);

export default function LoginScreen({ onLoginSuccess }) {
  // ✅ Empty initial values (Preserved exactly):
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    const data = await apiCall('/auth/login', 'POST', { username, password });
    setLoading(false);

    if (data.success) {
      if (data.token) {
        setAuthToken(data.token);
      }
      onLoginSuccess(data.operator);
    } else {
      Alert.alert('Login Failed', data.message || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Security Status Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarInner}>
          <View style={styles.statusLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>BOOTH TERMINAL • SECURE CHANNEL</Text>
          </View>
          <View style={styles.statusRight}>
            <LockIcon size={12} color="#444653" />
            <Text style={styles.sslText}>256-Bit SSL</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={styles.card}>
            {/* Header Royal Blue Banner */}
            <View style={styles.banner}>
              <View style={styles.bannerGlow} />
              <Text style={styles.bannerTitle}>Welcome to EMS</Text>
              <Text style={styles.bannerSubtitle}>Authorized Booth Officer Login</Text>
            </View>

            {/* Overlapping Officer Crest Token with EMS Ballot Logo */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarOuter}>
                <View style={styles.avatarInner}>
                  <Image
                    source={require('../../assets/android/ic_launcher-web.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <View style={styles.avatarCheckBadge}>
                    <Text style={styles.badgeCheckText}>✓</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Form Content */}
            <View style={styles.form}>
              {/* Presiding Officer Notice */}
              <View style={styles.noticeBox}>
                <View style={styles.noticeIconWrapper}>
                  <ShieldCheckIcon />
                </View>
                <View style={styles.noticeContent}>
                  <Text style={styles.noticeTitle}>PRESIDING OFFICER VERIFICATION</Text>
                  <Text style={styles.noticeSubtitle}>
                    Enter your assigned polling staff credentials to initialize ballot counting.
                  </Text>
                </View>
              </View>

              {/* Username Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <View style={styles.labelLeft}>
                    <BadgeIcon color="#444653" />
                    <Text style={styles.label}>Username</Text>
                  </View>
                  <Text style={styles.labelSubtext}>Officer ID</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputLeftIcon}>
                    <BadgeIcon color="#757684" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your username"
                    placeholderTextColor="#757684"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.inputRightIcon}>
                    <PersonIcon color="#c4c5d5" />
                  </View>
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <View style={styles.labelLeft}>
                    <KeyIcon color="#444653" />
                    <Text style={styles.label}>Password</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Alert.alert(
                        'Reset Key',
                        'Please contact your Polling Unit Supervisor to reset your security key.'
                      )
                    }
                  >
                    <Text style={styles.resetKeyText}>Reset Key</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputLeftIcon}>
                    <LockIcon size={14} color="#757684" />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#757684"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <EyeIcon visible={showPassword} color="#757684" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login CTA Button */}
              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.loginBtnText}>Authenticating…</Text>
                  </View>
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.loginBtnText}>Login to Booth Terminal</Text>
                    <ArrowRightIcon />
                  </View>
                )}
              </TouchableOpacity>

              {/* Local Encryption Notice */}
              <Text style={styles.encryptionNotice}>
                Operating under strict local encryption. Tally buffers sync automatically when connection restores.
              </Text>
            </View>
          </View>

          {/* Supervisor Support Footer Link */}
          <TouchableOpacity
            style={styles.supportLink}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Supervisor Support',
                'Please contact your Polling Unit Supervisor at the designated operations desk.'
              )
            }
          >
            <SupportIcon color="#1e40af" />
            <Text style={styles.supportLinkText}>
              Need help? Contact Polling Unit Supervisor
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  topBar: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 197, 213, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  topBarInner: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006a63',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#444653',
    letterSpacing: 0.6,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sslText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444653',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
    paddingBottom: 36,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(196, 197, 213, 0.45)',
    overflow: 'hidden',
    shadowColor: '#131b2e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  banner: {
    backgroundColor: '#1e40af',
    paddingTop: 30,
    paddingBottom: 42,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(55, 85, 195, 0.35)',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#a8b8ff',
    fontSize: 13.5,
    fontWeight: '500',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -32,
    marginBottom: 6,
    zIndex: 20,
  },
  avatarOuter: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(196, 197, 213, 0.6)',
    shadowColor: '#131b2e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f2f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#006a63',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCheckText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '900',
    marginTop: -1,
  },
  form: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f2f3ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(196, 197, 213, 0.35)',
    padding: 12,
    marginBottom: 18,
    gap: 10,
  },
  noticeIconWrapper: {
    marginTop: 1,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e40af',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  noticeSubtitle: {
    fontSize: 12,
    color: '#444653',
    lineHeight: 16.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#131b2e',
  },
  labelSubtext: {
    fontSize: 11.5,
    color: '#757684',
    fontWeight: '500',
  },
  resetKeyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  inputWrapper: {
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c4c5d5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputLeftIcon: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRightIcon: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#131b2e',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    height: 50,
    backgroundColor: '#1e40af',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnDisabled: {
    opacity: 0.75,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  encryptionNotice: {
    fontSize: 11.5,
    color: '#757684',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 14,
    paddingHorizontal: 10,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  supportLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1e40af',
  },
});