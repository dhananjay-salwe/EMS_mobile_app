import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { updateProfile, removeProfilePicture } from '../api/client';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';

// --- Pure React Native Vector Icons (Zero Font Dependencies, Crash-Proof) ---

const LockIcon = ({ size = 12, color = '#64748b' }) => (
  <View style={{ width: size, height: size + 3, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.58,
        borderWidth: 1.5,
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
        height: size * 0.62,
        backgroundColor: color,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 1.5, height: 2, backgroundColor: '#ffffff', borderRadius: 1 }} />
    </View>
  </View>
);

const PersonIcon = ({ size = 16, color = '#94a3b8' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: (size * 0.42) / 2, backgroundColor: color, marginBottom: 1.5 }} />
    <View
      style={{
        width: size * 0.82,
        height: size * 0.38,
        borderTopLeftRadius: size * 0.4,
        borderTopRightRadius: size * 0.4,
        backgroundColor: color,
      }}
    />
  </View>
);

const AtIcon = ({ size = 15, color = '#94a3b8' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: size - 1, fontWeight: '700', color, lineHeight: size }}>@</Text>
  </View>
);

const ShieldIcon = ({ size = 16, color = '#1d4ed8' }) => (
  <View
    style={{
      width: size,
      height: size + 2,
      borderWidth: 1.6,
      borderColor: color,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      borderBottomLeftRadius: size / 2,
      borderBottomRightRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    }}
  >
    <Text style={{ fontSize: size * 0.55, fontWeight: '900', color, marginTop: -2 }}>✓</Text>
  </View>
);

const PinIcon = ({ size = 16, color = '#1d4ed8' }) => (
  <View style={{ width: size, height: size + 2, alignItems: 'center' }}>
    <View
      style={{
        width: size * 0.75,
        height: size * 0.75,
        borderRadius: (size * 0.75) / 2,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
    </View>
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderTopWidth: 4,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
        marginTop: -1,
      }}
    />
  </View>
);

const CameraIcon = ({ size = 14, color = '#ffffff' }) => (
  <View style={{ width: size + 2, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Flash bump */}
    <View style={{ width: size * 0.35, height: 2, backgroundColor: color, borderRadius: 1, marginBottom: 1 }} />
    {/* Body */}
    <View
      style={{
        width: size + 2,
        height: size - 2,
        borderWidth: 1.4,
        borderColor: color,
        borderRadius: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: size * 0.36, height: size * 0.36, borderRadius: (size * 0.36) / 2, borderWidth: 1.2, borderColor: color }} />
    </View>
  </View>
);

const LogoutIcon = ({ size = 14, color = '#dc2626' }) => (
  <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    {/* Bracket door */}
    <View
      style={{
        width: size * 0.45,
        height: size * 0.85,
        borderWidth: 1.5,
        borderColor: color,
        borderRightWidth: 0,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
        marginRight: 2,
      }}
    />
    {/* Arrow out */}
    <View style={{ width: size * 0.45, height: 1.5, backgroundColor: color }} />
    <View
      style={{
        width: 4,
        height: 4,
        borderTopWidth: 1.5,
        borderRightWidth: 1.5,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginLeft: -3,
      }}
    />
  </View>
);

const ArrowBackIcon = ({ size = 13, color = '#334155' }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: 6,
        height: 6,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

const SupportIcon = ({ size = 16, color = '#1d4ed8' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Headset band */}
    <View
      style={{
        width: size * 0.82,
        height: size * 0.65,
        borderWidth: 1.6,
        borderColor: color,
        borderTopLeftRadius: (size * 0.82) / 2,
        borderTopRightRadius: (size * 0.82) / 2,
        borderBottomWidth: 0,
      }}
    />
    {/* Ear cups */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: size, marginTop: -2 }}>
      <View style={{ width: 3, height: 5, backgroundColor: color, borderRadius: 1.5 }} />
      <View style={{ width: 3, height: 5, backgroundColor: color, borderRadius: 1.5 }} />
    </View>
    {/* Mic */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 2,
        width: 5,
        height: 3,
        borderBottomWidth: 1.5,
        borderLeftWidth: 1.5,
        borderColor: color,
      }}
    />
  </View>
);

export default function ProfileScreen({ operator, selectedBooth, onUpdateOperator, onBack, onLogout }) {
  // ✅ Preserved state variables:
  const [fullName, setFullName] = useState(operator?.full_name || '');
  const [currentPictureUrl, setCurrentPictureUrl] = useState(
    operator?.profile_picture || operator?.profile_picture_url || operator?.avatar_url || null
  );
  const [pendingLocalImageUri, setPendingLocalImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingPicture, setRemovingPicture] = useState(false);

  // Compress selected avatar using expo-image-manipulator (Preserved)
  const compressImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 500 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (err) {
      console.warn('Image compression fallback:', err);
      return uri;
    }
  };

  // Launch gallery picker and compress selected image (Preserved)
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required to select a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const originalUri = result.assets[0].uri;
      const compressedUri = await compressImage(originalUri);
      setPendingLocalImageUri(compressedUri);
    }
  };

  // Submit profile changes (PUT /auth/profile with multipart/form-data) (Preserved)
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name cannot be blank.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile(fullName, pendingLocalImageUri);
      if (res.success) {
        const updatedPhoto =
          res.profile_picture ||
          res.profile_picture_url ||
          pendingLocalImageUri ||
          currentPictureUrl;
        setCurrentPictureUrl(updatedPhoto);
        setPendingLocalImageUri(null);

        // Instantly notify parent so the app header updates in real-time
        if (onUpdateOperator) {
          onUpdateOperator({
            full_name: fullName.trim(),
            profile_picture: updatedPhoto,
            profile_picture_url: updatedPhoto,
          });
        }

        Alert.alert('Success', 'Profile updated successfully.');
      } else {
        Alert.alert('Update Failed', res.message || 'Could not update profile.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // Remove profile picture (DELETE /auth/profile/picture) (Preserved)
  const handleRemovePicture = async () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingPicture(true);
            try {
              const res = await removeProfilePicture();
              if (res.success) {
                setCurrentPictureUrl(null);
                setPendingLocalImageUri(null);

                // Update parent operator state to refresh header immediately
                if (onUpdateOperator) {
                  onUpdateOperator({ profile_picture: null, profile_picture_url: null, avatar_url: null });
                }
                Alert.alert('Success', 'Profile picture removed.');
              } else {
                Alert.alert('Error', res.message || 'Could not remove profile picture.');
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to remove picture.');
            } finally {
              setRemovingPicture(false);
            }
          },
        },
      ]
    );
  };

  const initial = (fullName || operator?.username || '?').charAt(0).toUpperCase();
  const displayImageUri = pendingLocalImageUri || currentPictureUrl;
  const terminalAuthId = operator?.id ? `#${String(operator.id).padStart(3, '0')}` : '#042';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Sub-Header */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
            <ArrowBackIcon size={12} color="#334155" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          {/* <View style={styles.navTitleContainer}>
            <Text style={styles.navTitle}>Officer Profile</Text>
            <Text style={styles.navSubtitle}>Terminal Authorization ID {terminalAuthId}</Text>
          </View> */}
          <View style={{ width: 56 }} />
        </View>

        {/* Avatar Upload Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarGlow} />
          <View style={styles.avatarRingWrapper}>
            <View style={styles.avatarRing}>
              {displayImageUri ? (
                <Image source={{ uri: displayImageUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>{initial}</Text>
                </View>
              )}
              {removingPicture && (
                <View style={styles.overlay}>
                  <ActivityIndicator color="#ffffff" size="small" />
                </View>
              )}
            </View>
            {/* Accredited Officer Badge */}
            <View style={styles.avatarBadge}>
              <CameraIcon size={10} color="#ffffff" />
            </View>
          </View>

          {pendingLocalImageUri && (
            <Text style={styles.pendingHint}>New photo selected (tap Save to apply)</Text>
          )}

          {/* Action Buttons: Choose Photo & Remove */}
          <View style={styles.avatarActions}>
            <TouchableOpacity
              style={styles.choosePhotoBtn}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <CameraIcon size={14} color="#ffffff" />
              <Text style={styles.choosePhotoText}>
                {displayImageUri ? 'Change Photo' : 'Choose Photo'}
              </Text>
            </TouchableOpacity>

            {displayImageUri && (
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={handleRemovePicture}
                disabled={removingPicture || saving}
                activeOpacity={0.8}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.avatarHintText}>
            Official INEC / EMS ID standard (PNG, JPG • Max 5MB)
          </Text>
        </View>

        {/* Account Details Card */}
        <View style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardIconBox}>
                <PersonIcon size={14} color="#1d4ed8" />
              </View>
              <Text style={styles.cardHeaderTitle}>ACCOUNT DETAILS</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>VERIFIED STAFF</Text>
            </View>
          </View>

          {/* Full Name (Editable) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconLeft}>
                <PersonIcon size={16} color="#94a3b8" />
              </View>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Username (Read-Only) */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Username (Read-Only)</Text>
              <View style={styles.lockedRow}>
                <LockIcon size={10} color="#94a3b8" />
                <Text style={styles.lockedText}>Locked</Text>
              </View>
            </View>
            <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
              <View style={styles.inputIconLeft}>
                <AtIcon size={15} color="#94a3b8" />
              </View>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={operator?.username || '—'}
                editable={false}
              />
            </View>
          </View>

          {/* Designation (Read-Only) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Designation</Text>
            <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
              <View style={styles.inputIconLeft}>
                <ShieldIcon size={14} color="#94a3b8" />
              </View>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={operator?.role || 'Booth Officer'}
                editable={false}
              />
            </View>
          </View>

          {/* Assigned Polling Booth (Read-Only) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Assigned Polling Booth</Text>
            <View style={[styles.inputWrapper, styles.readOnlyWrapper]}>
              <View style={styles.inputIconLeft}>
                <PinIcon size={15} color="#1d4ed8" />
              </View>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={
                  selectedBooth
                    ? `${selectedBooth.booth_name} (${selectedBooth.unique_booth_code})`
                    : 'Not assigned'
                }
                editable={false}
              />
            </View>
          </View>

          {/* Save Profile CTA Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Updating Terminal...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.checkmarkIcon}>✓</Text>
                <Text style={styles.saveBtnText}>Save Profile</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Cryptographic Signature Security Notice */}
        <View style={styles.securityNotice}>
          <ShieldIcon size={16} color="#1d4ed8" />
          <Text style={styles.securityNoticeText}>
            <Text style={styles.securityNoticeBold}>Cryptographic Signature Active: </Text>
            Any profile metadata changes are synchronized with the central state collation database.
          </Text>
        </View>

        {/* Terminal Sign Out Section */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <LogoutIcon size={14} color="#dc2626" />
            <Text style={styles.signOutBtnText}>Sign Out from Booth Terminal</Text>
          </TouchableOpacity>
          <Text style={styles.signOutHintText}>
            Requires booth supervisor authorization to re-assign hardware key
          </Text>
        </View>

        {/* Persistent Supervisor Support Bar */}
        <TouchableOpacity
          style={styles.supportFooter}
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert('Supervisor Support', 'Please contact your Polling Unit Supervisor at the operations desk.')
          }
        >
          <SupportIcon size={15} color="#1d4ed8" />
          <Text style={styles.supportFooterText}>Need help? Contact Polling Unit Supervisor</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: '#f8fafc',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  navTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 2,
  },
  avatarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(219, 234, 254, 0.45)',
  },
  avatarRingWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: '#60a5fa',
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  avatarLetter: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1d4ed8',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingHint: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#d97706',
    marginTop: 4,
    marginBottom: 6,
  },
  avatarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  choosePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1d4ed8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  choosePhotoText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  removePhotoBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  removePhotoText: {
    color: '#dc2626',
    fontSize: 12.5,
    fontWeight: '700',
  },
  avatarHintText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 10,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.6,
  },
  verifiedBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: 0.4,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  lockedText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94a3b8',
  },
  inputWrapper: {
    height: 44,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  readOnlyWrapper: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  inputIconLeft: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    color: '#0f172a',
    fontWeight: '500',
    paddingVertical: 0,
  },
  readOnlyInput: {
    color: '#64748b',
  },
  saveBtn: {
    height: 46,
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.75,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  checkmarkIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(239, 246, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16.5,
  },
  securityNoticeBold: {
    fontWeight: '800',
    color: '#1e3a8a',
  },
  signOutSection: {
    marginBottom: 14,
  },
  signOutBtn: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
  },
  signOutBtnText: {
    color: '#dc2626',
    fontSize: 12.5,
    fontWeight: '700',
  },
  signOutHintText: {
    fontSize: 10.5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
  },
  supportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  supportFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
});
