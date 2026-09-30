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
import { Video, ResizeMode } from 'expo-av';
import { apiCall } from '../api/client';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';

// --- Pure React Native Vector Icons (Zero Font Dependencies, Crash-Proof) ---

const CameraIcon = ({ size = 18, color = '#1e40af' }) => {
  const bumpW = Math.round(size * 0.38);
  const bumpH = Math.max(2, Math.round(size * 0.1));
  const stroke = Math.max(1.6, Math.round(size * 0.08 * 10) / 10);
  const lens = Math.round(size * 0.4);
  return (
    <View style={{ width: size + 2, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: bumpW, height: bumpH, backgroundColor: color, borderRadius: 1, marginBottom: 1 }} />
      <View
        style={{
          width: size + 2,
          height: size - bumpH - 1,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: lens, height: lens, borderRadius: lens / 2, borderWidth: stroke, borderColor: color }} />
      </View>
    </View>
  );
};

const VideoIcon = ({ size = 18, color = '#444653' }) => {
  const stroke = Math.max(1.6, Math.round(size * 0.08 * 10) / 10);
  const triH = Math.max(4, Math.round(size * 0.26));
  const triW = Math.max(5, Math.round(size * 0.28));
  return (
    <View style={{ width: size + 4, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.68,
          height: size * 0.64,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: triH,
          borderBottomWidth: triH,
          borderLeftWidth: triW,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: color,
          marginLeft: 2,
        }}
      />
    </View>
  );
};

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

const ReplaceIcon = ({ size = 16, color = '#ffffff' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: (size * 0.8) / 2,
        borderWidth: 1.8,
        borderColor: color,
        borderTopColor: 'transparent',
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 0.5,
        left: size * 0.22,
        width: 0,
        height: 0,
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderLeftWidth: 4.5,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: color,
      }}
    />
  </View>
);

const RemoveIcon = ({ size = 14, color = '#ffffff' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.85,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
      }}
    />
    <View
      style={{
        width: size * 0.85,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '-45deg' }],
        position: 'absolute',
      }}
    />
  </View>
);

export default function VoteSubmissionScreen({ operator, selectedBooth }) {
  // ✅ Preserved candidates and votes state:
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  // ✅ Task 3: Separate states for Photo 1, Photo 2, and Video
  const [photo1Uri, setPhoto1Uri] = useState(null);
  const [photo2Uri, setPhoto2Uri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [photo1Aspect, setPhoto1Aspect] = useState(null);
  const [photo2Aspect, setPhoto2Aspect] = useState(null);
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

  // Compress captured camera image to <200KB utilizing expo-image-manipulator and capture natural aspect ratio
  const compressAndSetPhoto = async (uri, photoNumber) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const aspect =
        manipResult.width && manipResult.height
          ? manipResult.width / manipResult.height
          : undefined;

      if (photoNumber === 1) {
        setPhoto1Uri(manipResult.uri);
        if (aspect) setPhoto1Aspect(aspect);
      } else {
        setPhoto2Uri(manipResult.uri);
        if (aspect) setPhoto2Aspect(aspect);
      }
    } catch (err) {
      console.warn("Failed to compress image, using fallback:", err);
      Image.getSize(
        uri,
        (width, height) => {
          const aspect = width / height;
          if (photoNumber === 1) setPhoto1Aspect(aspect);
          else setPhoto2Aspect(aspect);
        },
        () => { }
      );
      if (photoNumber === 1) {
        setPhoto1Uri(uri);
      } else {
        setPhoto2Uri(uri);
      }
    }
  };

  const pickPhoto = async (photoNumber) => {
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await compressAndSetPhoto(result.assets[0].uri, photoNumber);
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const compressedUri = await VideoCompressor.compress(
          result.assets[0].uri,
          { compressionMethod: 'auto' }
        );
        setVideoUri(compressedUri);
      } catch (err) {
        console.warn("Failed to compress video, using fallback:", err);
        setVideoUri(result.assets[0].uri);
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

    // Task 4: Strict validation logic checking all 3 media items
    if (!photo1Uri || !photo2Uri || !videoUri) {
      Alert.alert(
        "Missing Required Media",
        "All 3 media attachments (Image 1, Image 2, and Video) are strictly required before submitting.",
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
        uri: photo1Uri,
        name: `tally_1_${selectedBooth.booth_id}_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      formData.append("tally_sheet_2", {
        uri: photo2Uri,
        name: `tally_2_${selectedBooth.booth_id}_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      if (videoUri) {
        formData.append("tally_video", {
          uri: videoUri,
          name: "tally_video.mp4",
          type: "video/mp4",
        });
      }

      const data = await apiCall("/votes/submit-votes", "POST", formData, true);

      if (data.success) {
        Alert.alert(
          "Success!",
          "Vote results, Tally Sheets, and Video successfully recorded.",
        );

        // Reset form for potential re-submission
        const resetVotes = {};
        candidates.forEach((c) => {
          resetVotes[c.candidate_id] = "";
        });
        setVotes(resetVotes);
        setPhoto1Uri(null);
        setPhoto2Uri(null);
        setVideoUri(null);
        setPhoto1Aspect(null);
        setPhoto2Aspect(null);
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

  const attachedCount = (photo1Uri ? 1 : 0) + (photo2Uri ? 1 : 0) + (videoUri ? 1 : 0);
  const isSubmissionReady = Boolean(photo1Uri && photo2Uri && videoUri);

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
        keyboardShouldPersistTaps="handled"
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
            {/* Booth Media & Form EC8A Section Header */}
            <View style={styles.mediaHeaderRow}>
              <View style={styles.mediaTitleLeft}>
                <Text style={styles.mediaSectionTitle}>BOOTH MEDIA & EVIDENCE</Text>
                <View style={styles.mandatoryBadge}>
                  <Text style={styles.mandatoryBadgeText}>All 3 Mandatory</Text>
                </View>
              </View>
              <Text style={styles.attachedCountText}>{attachedCount} of 3 attached</Text>
            </View>

            {/* Media Upload Cards */}
            <View style={styles.mediaStack}>
              {/* 1. Photo 1 Card */}
              {!photo1Uri ? (
                <TouchableOpacity
                  style={styles.mediaCard}
                  onPress={() => pickPhoto(1)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <CameraIcon size={26} color="#2563EB" />
                  </View>
                  <Text style={styles.emptyCardText}>Take a Photo</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.mediaCard}>
                  <Image
                    source={{ uri: photo1Uri }}
                    style={[
                      styles.mediaPreview,
                      { aspectRatio: photo1Aspect || 3 / 4 },
                    ]}
                    resizeMode="contain"
                    onLoad={(e) => {
                      const { width, height } = e.nativeEvent.source;
                      if (width && height && height > 0) {
                        setPhoto1Aspect(width / height);
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => pickPhoto(1)}
                    activeOpacity={0.7}
                  >
                    <CameraIcon size={16} color="#2563EB" />
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 2. Photo 2 Card */}
              {!photo2Uri ? (
                <TouchableOpacity
                  style={styles.mediaCard}
                  onPress={() => pickPhoto(2)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <CameraIcon size={26} color="#2563EB" />
                  </View>
                  <Text style={styles.emptyCardText}>Take a Photo</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.mediaCard}>
                  <Image
                    source={{ uri: photo2Uri }}
                    style={[
                      styles.mediaPreview,
                      { aspectRatio: photo2Aspect || 3 / 4 },
                    ]}
                    resizeMode="contain"
                    onLoad={(e) => {
                      const { width, height } = e.nativeEvent.source;
                      if (width && height && height > 0) {
                        setPhoto2Aspect(width / height);
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => pickPhoto(2)}
                    activeOpacity={0.7}
                  >
                    <CameraIcon size={16} color="#2563EB" />
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 3. Video Card */}
              {!videoUri ? (
                <TouchableOpacity
                  style={styles.mediaCard}
                  onPress={recordVideo}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <VideoIcon size={26} color="#2563EB" />
                  </View>
                  <Text style={styles.emptyCardText}>Record video</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.mediaCard}>
                  <Video
                    source={{ uri: videoUri }}
                    style={styles.videoPreview}
                    useNativeControls={true}
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={recordVideo}
                    activeOpacity={0.7}
                  >
                    <CameraIcon size={16} color="#2563EB" />
                    <Text style={styles.retakeBtnText}>Re-record</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Legal Compliance & Safety Callout */}
            <View style={styles.complianceBox}>
              <ShieldCheckIcon size={18} color="#1e40af" />
              <Text style={styles.complianceText}>
                Submission hashes the tally cryptographically to the central collation server. Ensure all accredited party agents have witnessed the vote entries.
              </Text>
            </View>

            {/* Primary Submission Button - Strictly disabled unless all 3 media items are attached */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!isSubmissionReady || submitting) && styles.submitBtnDisabled,
              ]}
              onPress={submitData}
              disabled={!isSubmissionReady || submitting}
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
              {!isSubmissionReady
                ? "⚠️ All 3 media items required (Image 1, Image 2 and Video)"
                : "Requires booth officer confirmation"}
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
  mediaStack: {
    flexDirection: 'column',
    width: '100%',
  },
  mediaCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardText: {
    color: '#4B5563',
    marginTop: 12,
    fontSize: 14,
  },
  mediaPreview: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  videoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  retakeBtn: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  retakeBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
    backgroundColor: '#94a3b8',
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
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
