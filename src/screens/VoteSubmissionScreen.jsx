import React, { useState, useEffect } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
// OLD CODE:
// import * as ImageManipulator from "expo-image-manipulator";
// import { apiCall } from "../api/client";
// import Button from "../components/Button";

// FEATURE: Import VideoCompressor for compressed video uploading
import * as ImageManipulator from "expo-image-manipulator";
import { Video as VideoCompressor } from 'react-native-compressor';
import { apiCall } from "../api/client";
import Button from "../components/Button";
import { COLORS, RADIUS, SPACING, FONTS, SHADOW } from "../theme";

export default function VoteSubmissionScreen({ operator, selectedBooth }) {
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  // OLD CODE:
  // const [tallyImage, setTallyImage] = useState(null);
  // const [submitting, setSubmitting] = useState(false);
  // const [loading, setLoading] = useState(true);

  // FEATURE: Add tallyVideo state and keep existing states
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
        `/candidates/by-booth/${selectedBooth.booth_id}`,
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

  // OLD CODE:
  // const pickImage = async () => {
  //   const { status } = await ImagePicker.requestCameraPermissionsAsync();
  //   if (status !== "granted") {
  //     Alert.alert(
  //       "Permission Denied",
  //       "Camera access is required to capture the tally sheet.",
  //     );
  //     return;
  //   }
  // 
  //   let result = await ImagePicker.launchCameraAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     quality: 0.5,
  //   });
  // 
  //   if (!result.canceled && result.assets.length > 0) {
  //     setTallyImage(result.assets[0]);
  //   }
  // };
  // 
  // const pickFromGallery = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== "granted") {
  //     Alert.alert(
  //       "Permission Denied",
  //       "Gallery access is required to select tally sheet.",
  //     );
  //     return;
  //   }
  // 
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     quality: 0.7,
  //   });
  // 
  //   if (!result.canceled && result.assets.length > 0) {
  //     setTallyImage(result.assets[0]);
  //   }
  // };

  // FIX: Compress captured camera image to <200KB utilizing expo-image-manipulator
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

  // FEATURE: recordVideo function utilizing ImagePicker and VideoCompressor
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
      // OLD CODE:
      // const formData = new FormData();
      // formData.append("operator_id", operator.id);
      // formData.append("booth_id", selectedBooth.booth_id);
      // formData.append("votes", JSON.stringify(votePayload));
      // 
      // formData.append("tally_sheet", {
      //   uri: tallyImage.uri,
      //   name: `tally_${selectedBooth.booth_id}_${Date.now()}.jpg`,
      //   type: "image/jpeg",
      // });
      // 
      // const data = await apiCall("/votes/submit-votes", "POST", formData, true);
      // 
      // if (data.success) {
      //   Alert.alert(
      //     "Success!",
      //     "Vote results and tally sheet photo successfully recorded.",
      //   );
      // 
      //   // Reset form for potential re-submission (or they can just logout)
      //   const resetVotes = {};
      //   candidates.forEach((c) => {
      //     resetVotes[c.candidate_id] = "";
      //   });
      //   setVotes(resetVotes);
      //   setTallyImage(null);

      // FEATURE: Append tally video to formData and reset state on success
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

        // Reset form for potential re-submission (or they can just logout)
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading ward candidates…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.bodyBg }}
    >
      <FlatList
        data={candidates}
        keyExtractor={(item) => item.candidate_id.toString()}
        contentContainerStyle={{ padding: SPACING.md }}
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>
            Booth Voting Report
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.candidateRow}>
            {item.party_icon_url ? (
              <Image
                source={{ uri: item.party_icon_url }}
                style={styles.partyIcon}
              />
            ) : (
              <View style={styles.partyIconPlaceholder}>
                <Text style={styles.partyIconInitial}>
                  {item.party_name?.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.candidateInfo}>
              <Text style={styles.candidateName}>{item.candidate_name}</Text>
              <Text style={styles.partyName}>
                {item.party_name} ({item.party_code})
              </Text>
            </View>
            <TextInput
              style={styles.voteInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#adb2bc"
              value={
                votes[item.candidate_id]
                  ? votes[item.candidate_id].toString()
                  : ""
              }
              onChangeText={(text) => updateVote(item.candidate_id, text)}
            />
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {/* OLD CODE:
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={tallyImage ? "📷 Retake" : "📷 Camera"}
                  variant="dark"
                  onPress={pickImage}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="📁 From Files"
                  variant="secondary"
                  onPress={pickFromGallery}
                />
              </View>
            </View>
            */}

            {/* FEATURE: Add Record Video button and status indicator */}
            {/* Media Attachment Action Buttons */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {/* 1. Camera Button */}
              <View style={{ flex: 1 }}>
                <Button
                  title={tallyImage ? "📷 Retake" : "📷 Photo"}
                  variant="secondary"
                  onPress={pickImage}
                />
              </View>

              {/* 2. Video Button */}
              <View style={{ flex: 1 }}>
                <Button
                  title={tallyVideo ? "🎥 Retake" : "🎥 Video"}
                  variant="secondary"
                  onPress={recordVideo}
                />
              </View>

              {/* 3. Files Button */}
              <View style={{ flex: 1 }}>
                <Button
                  title="📁 Files"
                  variant="secondary"
                  onPress={pickFromGallery}
                />
              </View>
            </View>

            {tallyVideo && (
              <View style={styles.attachedContainer}>
                <Text style={styles.attachedText}>✅ Video Attached</Text>
              </View>
            )}

            {tallyImage && (
              <Image
                source={{ uri: tallyImage.uri }}
                style={styles.previewImage}
              />
            )}

            <Button
              title={
                submitting ? "Submitting to server…" : "Submit Final Votes"
              }
              variant="primary"
              onPress={submitData}
              loading={submitting}
            />
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bodyBg,
  },
  loadingText: { marginTop: 10, color: COLORS.textMuted, fontSize: 13 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  candidateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 14,
    marginBottom: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  partyIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    marginRight: 12,
  },
  partyIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    marginRight: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  partyIconInitial: { color: COLORS.primary, fontWeight: "700", fontSize: 15 },
  candidateInfo: { flex: 1 },
  candidateName: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: FONTS.bold,
    color: COLORS.textDark,
  },
  partyName: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  voteInput: {
    backgroundColor: COLORS.bodyBg,
    width: 68,
    height: 44,
    textAlign: "center",
    borderRadius: RADIUS.md,
    fontWeight: "700",
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    color: COLORS.textDark,
  },
  footer: { marginTop: 14, paddingBottom: 40 },
  previewImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
    marginBottom: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // FEATURE: Styles for the video attachment indicator
  attachedContainer: {
    backgroundColor: COLORS.successSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  attachedText: {
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 14.5,
  },
});
