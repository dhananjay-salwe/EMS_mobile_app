import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Video as VideoCompressor } from 'react-native-compressor';
import { apiCall } from '../api/client';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';

// --- Pure React Native Vector Icons (Zero Font Dependencies, Crash-Proof) ---

const CameraIcon = ({ size = 18, color = '#1e40af' }) => (
  <View style={{ width: size + 2, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.38, height: 2, backgroundColor: color, borderRadius: 1, marginBottom: 1 }} />
    <View
      style={{
        width: size + 2,
        height: size - 2,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: size * 0.38, height: size * 0.38, borderRadius: (size * 0.38) / 2, borderWidth: 1.4, borderColor: color }} />
    </View>
  </View>
);

const VideoIcon = ({ size = 18, color = '#444653' }) => (
  <View style={{ width: size + 2, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.68,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: 3,
      }}
    />
    <View
      style={{
        width: 0,
        height: 0,
        borderTopWidth: 4,
        borderBottomWidth: 4,
        borderLeftWidth: 5,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: color,
        marginLeft: 1.5,
      }}
    />
  </View>
);

const FolderIcon = ({ size = 18, color = '#444653' }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: size * 0.45, height: 3, backgroundColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2, alignSelf: 'flex-start', marginLeft: 1 }} />
    <View
      style={{
        width: size,
        height: size * 0.65,
        borderWidth: 1.6,
        borderColor: color,
        borderRadius: 3,
      }}
    />
  </View>
);

const ShieldCheckIcon = ({ size = 18, color = '#1e40af' }) => (
  <View
    style={{
      width: size,
      height: size + 3,
      borderWidth: 1.8,
      borderColor: color,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: size / 2,
      borderBottomRightRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
    }}
  >
    <Text style={{ fontSize: size * 0.55, fontWeight: '900', color, marginTop: -2 }}>✓</Text>
  </View>
);

const OfficerIcon = ({ size = 18, color = '#ffffff' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.45, height: size * 0.45, borderRadius: (size * 0.45) / 2, backgroundColor: color, marginBottom: 1 }} />
    <View
      style={{
        width: size * 0.85,
        height: size * 0.45,
        borderTopLeftRadius: size * 0.4,
        borderTopRightRadius: size * 0.4,
        backgroundColor: color,
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#006a63',
        borderWidth: 1,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 5, color: '#ffffff', fontWeight: '900' }}>✓</Text>
    </View>
  </View>
);

export default function VoteSubmissionScreen({ operator, selectedBooth }) {
  // ✅ Preserved states:
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  const [tallyImage, setTallyImage] = useState(null);
  const [tallyVideo, setTallyVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const data = await apiCall(
        `/candidates/by-booth/${selectedBooth.booth_id}`
      );
      if (data.success) {
        setCandidates(data.candidates);
        const initialVotes = {};
        data.candidates.forEach((c) => {
          initialVotes[c.candidate_id] = "";
        });
        setVotes(initialVotes);
      } else {
        Alert.alert("Error", "Failed to load candidates for this booth.");
      }
    } catch (err) {
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateVote = (candidateId, text) => {
    // Only allow numeric input
    setVotes((prev) => ({
      ...prev,
      [candidateId]: text.replace(/[^0-9]/g, ""),
    }));
  };

  // Stepper increment / decrement helper (calling updateVote to keep bindings intact)
  const adjustVote = (candidateId, delta) => {
    const current = parseInt(votes[candidateId], 10) || 0;
    const next = Math.max(0, current + delta);
    updateVote(candidateId, next.toString());
  };

  // Compress captured camera image to <200KB utilizing expo-image-manipulator (Preserved)
  const compressAndSetImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setTallyImage({
        uri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
      });
    } catch (err) {
      console.warn("Failed to compress image, using fallback:", err);
      setTallyImage({ uri });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to capture the tally sheet.",
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      await compressAndSetImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Gallery access is required to select tally sheet.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      await compressAndSetImage(result.assets[0].uri);
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to record the tally video.",
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        const compressedUri = await VideoCompressor.compress(
          result.assets[0].uri,
          { compressionMethod: 'auto' }
        );
        setTallyVideo(compressedUri);
      } catch (err) {
        console.warn("Failed to compress video, using fallback:", err);
        setTallyVideo(result.assets[0].uri);
      }
    }
  };

  const submitData = async () => {
    // Validation
    const votePayload = {};
    for (const c of candidates) {
      const count = parseInt(votes[c.candidate_id], 10);
      if (isNaN(count)) {
        Alert.alert(
          "Validation Error",
          `Please enter valid vote counts for ${c.candidate_name}.`,
        );
        return;
      }
      votePayload[c.candidate_id] = count;
    }

    if (!tallyImage) {
      Alert.alert(
        "Missing Photo",
        "Please capture the physical tally sheet photo before submitting.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("operator_id", operator.id);
      formData.append("booth_id", selectedBooth.booth_id);
      formData.append("votes", JSON.stringify(votePayload));

      formData.append("tally_sheet", {
        uri: tallyImage.uri,
        name: `tally_${selectedBooth.booth_id}_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      if (tallyVideo) {
        formData.append("tally_video", {
          uri: tallyVideo,
          name: "tally_video.mp4",
          type: "video/mp4",
        });
      }

      const data = await apiCall("/votes/submit-votes", "POST", formData, true);

      if (data.success) {
        Alert.alert(
          "Success!",
          "Vote results and tally sheet photo successfully recorded.",
        );

        // Reset form for potential re-submission
        const resetVotes = {};
        candidates.forEach((c) => {
          resetVotes[c.candidate_id] = "";
        });
        setVotes(resetVotes);
        setTallyImage(null);
        setTallyVideo(null);
      } else {
        Alert.alert("Submission Failed", data.message || "Error saving votes");
      }
    } catch (err) {
      Alert.alert("Error", "Network request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading ward candidates…</Text>
      </View>
    );
  }

  const attachedCount = (tallyImage ? 1 : 0) + (tallyVideo ? 1 : 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <FlatList
        data={candidates}
        keyExtractor={(item) => item.candidate_id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.sectionTitle}>CANDIDATE RETURNS</Text>
            <Text style={styles.sectionSubtitle}>Tap +/- or input value</Text>
          </View>
        }
        renderItem={({ item }) => {
          const initial = item.party_name ? item.party_name.charAt(0).toUpperCase() : 'A';
          return (
            <View style={styles.candidateCard}>
              <View style={styles.candidateLeft}>
                {item.party_icon_url ? (
                  <Image
                    source={{ uri: item.party_icon_url }}
                    style={styles.partyIcon}
                  />
                ) : (
                  <View style={styles.partyAvatar}>
                    <Text style={styles.partyAvatarText}>{initial}</Text>
                  </View>
                )}
                <View style={styles.candidateDetails}>
                  <Text style={styles.candidateName} numberOfLines={1}>
                    {item.candidate_name}
                  </Text>
                  <Text style={styles.partyName} numberOfLines={1}>
                    {item.party_name} {item.party_code ? `(${item.party_code})` : ''}
                  </Text>
                </View>
              </View>

              {/* Numeric Tally Stepper & Input Well */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustVote(item.candidate_id, -1)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.voteInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={
                    votes[item.candidate_id] !== undefined
                      ? votes[item.candidate_id].toString()
                      : ""
                  }
                  onChangeText={(text) => updateVote(item.candidate_id, text)}
                />

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustVote(item.candidate_id, 1)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            {/* Booth Media & Form EC8A Section */}
            {/* <View style={styles.mediaHeaderRow}>
              <View style={styles.mediaTitleLeft}>
                <Text style={styles.mediaSectionTitle}>BOOTH MEDIA & FORM EC8A</Text>
                <View style={styles.mandatoryBadge}>
                  <Text style={styles.mandatoryBadgeText}>EC8A Mandatory</Text>
                </View>
              </View>
              <Text style={styles.attachedCountText}>{attachedCount} of 2 attached</Text>
            </View> */}

            {/* 3-Column Action Grid */}
            <View style={styles.mediaGrid}>
              {/* 1. Camera Button */}
              <TouchableOpacity
                style={[
                  styles.mediaCard,
                  tallyImage && styles.mediaCardActive,
                ]}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <View style={[styles.mediaIconBox, tallyImage && styles.mediaIconBoxActive]}>
                  <CameraIcon size={18} color={tallyImage ? "#1e40af" : "#444653"} />
                </View>
                <Text style={styles.mediaLabel}>Camera</Text>
                <Text
                  style={[
                    styles.mediaSubtext,
                    tallyImage && styles.mediaSubtextActive,
                  ]}
                  numberOfLines={1}
                >
                  {tallyImage ? "EC8A Sheet • Added" : "EC8A Sheet"}
                </Text>
              </TouchableOpacity>

              {/* 2. Video Button */}
              <TouchableOpacity
                style={[
                  styles.mediaCard,
                  tallyVideo && styles.mediaCardActive,
                ]}
                onPress={recordVideo}
                activeOpacity={0.8}
              >
                <View style={[styles.mediaIconBox, tallyVideo && styles.mediaIconBoxActive]}>
                  <VideoIcon size={18} color={tallyVideo ? "#1e40af" : "#444653"} />
                </View>
                <Text style={styles.mediaLabel}>Record Video</Text>
                <Text
                  style={[
                    styles.mediaSubtext,
                    tallyVideo && styles.mediaSubtextActive,
                  ]}
                  numberOfLines={1}
                >
                  {tallyVideo ? "Video Added" : "Announcement"}
                </Text>
              </TouchableOpacity>

              {/* 3. Files Button */}
              {/* <TouchableOpacity
                style={styles.mediaCard}
                onPress={pickFromGallery}
                activeOpacity={0.8}
              >
                <View style={styles.mediaIconBox}>
                  <FolderIcon size={18} color="#444653" />
                </View>
                <Text style={styles.mediaLabel}>From Files</Text>
                <Text style={styles.mediaSubtext} numberOfLines={1}>
                  {tallyImage ? "1 attached" : "0 attached"}
                </Text>
              </TouchableOpacity> */}
            </View>

            {/* Attached Video Notification */}
            {tallyVideo && (
              <View style={styles.attachedBanner}>
                <Text style={styles.attachedBannerText}>✓ Video Announcement Recorded & Compressed</Text>
              </View>
            )}

            {/* Attached Photo Preview */}
            {tallyImage && (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: tallyImage.uri }}
                  style={styles.previewImage}
                />
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>EC8A Photo Attached</Text>
                </View>
              </View>
            )}

            {/* Legal Compliance & Safety Callout */}
            <View style={styles.complianceBox}>
              <ShieldCheckIcon size={18} color="#1e40af" />
              <Text style={styles.complianceText}>
                Submission hashes the tally cryptographically to the central collation server. Ensure all accredited party agents have witnessed the vote entries.
              </Text>
            </View>

            {/* Primary Submission Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={submitData}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <View style={styles.btnContent}>
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Submitting to server…</Text>
                </View>
              ) : (
                <View style={styles.btnContent}>
                  <OfficerIcon size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Submit Final Votes</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.confirmationHint}>
              Requires booth officer confirmation
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#faf8ff',
  },
  loadingText: {
    marginTop: 10,
    color: '#757684',
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 197, 213, 0.45)',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  candidateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  partyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(30, 64, 175, 0.15)',
  },
  partyAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eaedff',
    borderWidth: 1.5,
    borderColor: 'rgba(30, 64, 175, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partyAvatarText: {
    color: '#1e40af',
    fontWeight: '800',
    fontSize: 16,
  },
  candidateDetails: {
    flex: 1,
    minWidth: 0,
  },
  candidateName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  partyName: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 32,
    height: 40,
    backgroundColor: '#eaedff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    lineHeight: 20,
  },
  voteInput: {
    width: 60,
    height: 42,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    padding: 0,
  },
  footer: {
    marginTop: 8,
  },
  mediaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  mediaTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediaSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  mandatoryBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mandatoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#dc2626',
  },
  attachedCountText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  mediaCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 197, 213, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  mediaCardActive: {
    borderColor: '#1e40af',
    borderWidth: 2,
  },
  mediaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eaedff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mediaIconBoxActive: {
    backgroundColor: '#dde1ff',
  },
  mediaLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  mediaSubtext: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  mediaSubtextActive: {
    color: '#1e40af',
    fontWeight: '700',
  },
  attachedBanner: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedBannerText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 12,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewBadgeText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  complianceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f2f3ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 197, 213, 0.4)',
    padding: 12,
    marginBottom: 14,
  },
  complianceText: {
    flex: 1,
    fontSize: 11.5,
    color: '#444653',
    lineHeight: 16.5,
  },
  submitBtn: {
    height: 50,
    backgroundColor: '#1e40af',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.75,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  confirmationHint: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
  },
});
