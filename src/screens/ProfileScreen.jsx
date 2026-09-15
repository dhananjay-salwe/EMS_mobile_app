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
import Button from '../components/Button';
import { COLORS, RADIUS, SPACING, FONTS, SHADOW } from '../theme';

export default function ProfileScreen({ operator, selectedBooth, onUpdateOperator, onBack, onLogout }) {
  const [fullName, setFullName] = useState(operator?.full_name || '');
  const [currentPictureUrl, setCurrentPictureUrl] = useState(
    operator?.profile_picture_url || operator?.profile_picture || operator?.avatar_url || null
  );
  const [pendingLocalImageUri, setPendingLocalImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removingPicture, setRemovingPicture] = useState(false);

  // Compress selected avatar using expo-image-manipulator
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

  // Launch gallery picker and compress selected image
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

  // Submit profile changes (PUT /auth/profile with multipart/form-data)
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name cannot be blank.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile(fullName, pendingLocalImageUri);
      if (res.success) {
        const updatedPhoto = res.profile_picture_url || pendingLocalImageUri || currentPictureUrl;
        setCurrentPictureUrl(updatedPhoto);
        setPendingLocalImageUri(null);

        // Instantly notify parent so the app header updates in real-time
        if (onUpdateOperator) {
          onUpdateOperator({
            full_name: fullName.trim(),
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

  // Remove profile picture (DELETE /auth/profile/picture)
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
                  onUpdateOperator({ profile_picture_url: null, avatar_url: null });
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Officer Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Profile Picture Card */}
        <View style={styles.card}>
          <View style={styles.avatarSection}>
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
                  <ActivityIndicator color="#ffffff" />
                </View>
              )}
            </View>

            {pendingLocalImageUri && (
              <Text style={styles.pendingHint}>New photo selected (tap Save to apply)</Text>
            )}

            <View style={styles.avatarActionRow}>
              <TouchableOpacity
                style={styles.pickPhotoBtn}
                onPress={handlePickImage}
                activeOpacity={0.75}
              >
                <Text style={styles.pickPhotoText}>
                  {displayImageUri ? 'Change Photo' : 'Choose Photo'}
                </Text>
              </TouchableOpacity>

              {displayImageUri && (
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={handleRemovePicture}
                  disabled={removingPicture || saving}
                  activeOpacity={0.75}
                >
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Profile Information Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.label}>Username (Read-Only)</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={operator?.username || '—'}
            editable={false}
          />

          <Text style={styles.label}>Designation</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={operator?.role || 'Booth Officer'}
            editable={false}
          />

          {selectedBooth && (
            <>
              <Text style={styles.label}>Assigned Polling Booth</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={`${selectedBooth.booth_name} (${selectedBooth.unique_booth_code})`}
                editable={false}
              />
            </>
          )}

          <Button
            title={saving ? 'Saving...' : 'Save Profile'}
            onPress={handleSaveProfile}
            loading={saving}
            disabled={saving}
            style={{ marginTop: SPACING.md }}
          />
        </View>

        {/* Sign Out Card */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out from Booth Terminal</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.bodyBg,
    flexGrow: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    ...SHADOW,
  },
  backBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontWeight: '700',
    fontSize: 13,
  },
  navTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  avatarLetter: {
    fontSize: 34,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingHint: {
    fontSize: 11.5,
    color: COLORS.warning,
    fontWeight: '600',
    marginTop: 8,
  },
  avatarActionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  pickPhotoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
  },
  pickPhotoText: {
    color: COLORS.white,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    fontSize: 12.5,
  },
  removePhotoBtn: {
    backgroundColor: COLORS.dangerSoft,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
  },
  removePhotoText: {
    color: COLORS.danger,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    fontSize: 12.5,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 5,
    marginTop: SPACING.sm,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
  },
  readOnlyInput: {
    backgroundColor: COLORS.bodyBg,
    borderColor: COLORS.border,
    color: COLORS.textMuted,
  },
  logoutBtn: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  logoutText: {
    color: COLORS.danger,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    fontSize: 13.5,
  },
});
