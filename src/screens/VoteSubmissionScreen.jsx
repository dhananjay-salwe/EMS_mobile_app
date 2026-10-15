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
  useWindowDimensions,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { apiCall, uploadWithProgress } from '../api/client';
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

const GalleryIcon = ({ size = 20, color = '#1e40af' }) => {
  const stroke = 2;
  return (
    <View
      style={{
        width: size + 2,
        height: size,
        borderWidth: stroke,
        borderColor: color,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: (size * 0.28) / 2,
          backgroundColor: color,
          position: 'absolute',
          top: 2,
          right: 2.5,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.35,
          borderRightWidth: size * 0.35,
          borderBottomWidth: size * 0.45,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          position: 'absolute',
          bottom: 0,
          left: 1,
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
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 768;
  const isSmallScreen = windowWidth < 360;

  // ✅ Preserved candidates and votes state:
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState({});
  const [photo1Uri, setPhoto1Uri] = useState(null);
  const [photo2Uri, setPhoto2Uri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [photo1Aspect, setPhoto1Aspect] = useState(null);
  const [photo2Aspect, setPhoto2Aspect] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [compressingVideo, setCompressingVideo] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [captureTarget, setCaptureTarget] = useState(null); // 'photo1' | 'photo2' | 'video'

  // useEffect(() => {
  //   fetchCandidates();
  // }, []);

  // const fetchCandidates = async () => {
  //   try {
  //     const data = await apiCall(
  //       `/candidates/by-booth/${selectedBooth.booth_id}`
  //     );
  //     if (data.success) {
  //       setCandidates(data.candidates);
  //       const initialVotes = {};
  //       data.candidates.forEach((c) => {
  //         initialVotes[c.candidate_id] = "";
  //       });
  //       setVotes(initialVotes);
  //     } else {
  //       Alert.alert("Error", "Failed to load candidates for this booth.");
  //     }
  //   } catch (err) {
  //     Alert.alert("Error", "Network request failed.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

  const processAndCompressVideo = async (asset) => {
    if (!asset || !asset.uri) return;

    // Expo ImagePicker provides duration in milliseconds for videos.
    // If duration > 1000, convert to seconds. If already in seconds, use directly.
    const durationSeconds =
      typeof asset.duration === 'number'
        ? (asset.duration > 1000 ? asset.duration / 1000 : asset.duration)
        : null;

    if (durationSeconds !== null && durationSeconds > 180) {
      Alert.alert(
        "Video Limit Exceeded",
        "Please select a video with a maximum duration of 3 minutes."
      );
      return;
    }

    setCompressingVideo(true);
    setCompressionProgress(0);

    try {
      console.log('Starting video compression for:', asset.uri);
      // Aggressively compress video down to 720p / 1.5Mbps (e.g. 400MB down to ~20MB)
      const compressedUri = await Video.compress(
        asset.uri,
        {
          compressionMethod: 'auto',
          maxSize: 720,
          bitrate: 1500000,
        },
        (progress) => {
          setCompressionProgress(Math.round(progress * 100));
        }
      );

      console.log('Video compression complete:', compressedUri);
      setVideoDuration(durationSeconds);
      setVideoUri(compressedUri);
    } catch (err) {
      console.warn("Video compression fallback to original URI:", err);
      setVideoDuration(durationSeconds);
      setVideoUri(asset.uri);
    } finally {
      setCompressingVideo(false);
      setCompressionProgress(0);
    }
  };

  const handleCaptureOption = async (source) => {
    const target = captureTarget;
    setCaptureTarget(null);

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera access is required to capture media.'
        );
        return;
      }

      if (target === 'video') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: false,
          quality: 0.5,
          videoMaxDuration: 180, // Max video duration 3 minutes
          videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
          videoQuality: 0,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          await processAndCompressVideo(result.assets[0]);
        }
      } else {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images, // Photos only
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          await compressAndSetPhoto(result.assets[0].uri, target === 'photo2' ? 2 : 1);
        }
      }
    } else {
      // File Browser / Gallery
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Gallery access is required to select files.'
        );
        return;
      }

      if (target === 'video') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos, // Strictly videos only!
          allowsEditing: false,
          quality: 0.5,
          videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          await processAndCompressVideo(result.assets[0]);
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images, // Strictly photos only!
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          await compressAndSetPhoto(result.assets[0].uri, target === 'photo2' ? 2 : 1);
        }
      }
    }
  };

  const submitData = async () => {
    // 2 photos are strictly mandatory; video is optional
    if (!photo1Uri || !photo2Uri) {
      Alert.alert(
        "Missing Required Photos",
        "Both Tally Sheet Photo 1 and Photo 2 are required before submitting.",
      );
      return;
    }

    if (videoUri && videoDuration && videoDuration > 180) {
      Alert.alert(
        "Video Limit Exceeded",
        "Please attach video under 3 minute only!"
      );
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    setUploadSuccess(false);
    let isSuccess = false;

    // Keep mobile screen on during heavy file uploads
    try {
      await activateKeepAwakeAsync();
    } catch (wakeErr) {
      console.warn("Could not activate keep-awake:", wakeErr);
    }

    try {
      const formData = new FormData();
      formData.append("operator_id", String(operator.id));
      formData.append("booth_id", String(selectedBooth.booth_id));
      formData.append("votes", "{}");

      formData.append("tally_sheet", {
        uri: Platform.OS === 'android' ? photo1Uri : photo1Uri.replace('file://', ''),
        name: `tally_1_${selectedBooth.booth_id}_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      formData.append("tally_sheet_2", {
        uri: Platform.OS === 'android' ? photo2Uri : photo2Uri.replace('file://', ''),
        name: `tally_2_${selectedBooth.booth_id}_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      if (videoUri) {
        const uriParts = videoUri.split('.');
        const fileExt = uriParts[uriParts.length - 1] || 'mp4';
        const isQuickTime = fileExt.toLowerCase() === 'mov';

        formData.append("tally_video", {
          uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
          name: `tally_video_${selectedBooth.booth_id}_${Date.now()}.${isQuickTime ? 'mov' : 'mp4'}`,
          type: isQuickTime ? 'video/quicktime' : 'video/mp4',
        });
      }

      const data = await uploadWithProgress(
        "/votes/submit-votes",
        formData,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (data.success) {

        isSuccess = true;
        // Alert.alert(
        //   "Upload Successful!",
        //   "Your photo/video evidance have been uploaded successfully.",
        // );

        setUploadSuccess(true);

        // Reset form for potential re-submission
        const resetVotes = {};
        candidates.forEach((c) => {
          resetVotes[c.candidate_id] = "";
        });
        setVotes(resetVotes);
        setPhoto1Uri(null);
        setPhoto2Uri(null);
        setVideoUri(null);
        setVideoDuration(null);
        setPhoto1Aspect(null);
        setPhoto2Aspect(null);
      } else {
        Alert.alert("Submission Failed", data.message || "Error saving votes");
      }
    } catch (err) {
      Alert.alert("Error", "Network request failed: " + (err.message || "Unknown error"));
    } finally {
      try {
        deactivateKeepAwake();
      } catch (_) {}
      // setSubmitting(false);
      // setUploadProgress(0);
      setSubmitting(false);

      // if(isSuccess){
      //   setSubmitting(false);
      //   setUploadProgress(0);
      // } 

    }
  };

  // if (loading) {
  //   return (
  //     <View style={styles.center}>
  //       <ActivityIndicator size="large" color="#1e40af" />
  //       <Text style={styles.loadingText}>Loading ward candidates…</Text>
  //     </View>
  //   );
  // }

  const attachedPhotosCount = (photo1Uri ? 1 : 0) + (photo2Uri ? 1 : 0);
  const isSubmissionReady = Boolean(photo1Uri && photo2Uri);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <FlatList
        // data={candidates}
        data={[]}
        keyExtractor={(item) => item.candidate_id.toString()}
        contentContainerStyle={[
          styles.listContent,
          isTablet && styles.listContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={null}
        renderItem={() => null}
        ListFooterComponent={
          <View style={styles.footer}>
            {/* Booth Media Section Header */}
            <View style={styles.mediaHeaderRow}>
              <View style={styles.mediaTitleLeft}>
                <Text style={styles.mediaSectionTitle}>UPLOAD MEDIA & EVIDENCE</Text>
                <View style={styles.mandatoryBadge}>
                  <Text style={styles.mandatoryBadgeText}>2 Photos Mandatory</Text>
                </View>
              </View>
              <Text style={styles.attachedCountText}>
                {attachedPhotosCount} of 2 photos attached{videoUri ? ' • Video added' : ''}
              </Text>
            </View>

            {/* Media Upload Cards: Only 3 Cards (Photo 1, Photo 2, Video) */}
            <View style={styles.mediaStack}>
              {/* 1. Photo 1 Card */}
              {!photo1Uri ? (
                <TouchableOpacity
                  style={styles.mediaCard}
                  onPress={() => setCaptureTarget('photo1')}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <CameraIcon size={28} color="#2563EB" />
                  </View>
                  <Text style={styles.emptyCardText}>Take a Photo</Text>
                  {/* <Text style={styles.emptyCardSubtext}>Tally Sheet - Photo 1 (Mandatory)</Text> */}
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
                  <View style={styles.mediaCardActions}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={() => setCaptureTarget('photo1')}
                      activeOpacity={0.7}
                    >
                      <CameraIcon size={16} color="#2563EB" />
                      <Text style={styles.retakeBtnText}>Retake Photo 1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeMediaBtn}
                      onPress={() => setPhoto1Uri(null)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.removeMediaBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 2. Photo 2 Card */}
              {!photo2Uri ? (
                <TouchableOpacity
                  style={styles.mediaCard}
                  onPress={() => setCaptureTarget('photo2')}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <CameraIcon size={28} color="#2563EB" />
                  </View>
                  <Text style={styles.emptyCardText}>Take a Photo</Text>
                  {/* <Text style={styles.emptyCardSubtext}>Tally Sheet - Photo 2 (Mandatory)</Text> */}
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
                  <View style={styles.mediaCardActions}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={() => setCaptureTarget('photo2')}
                      activeOpacity={0.7}
                    >
                      <CameraIcon size={16} color="#2563EB" />
                      <Text style={styles.retakeBtnText}>Retake Photo 2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeMediaBtn}
                      onPress={() => setPhoto2Uri(null)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.removeMediaBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 3. Video Card (Optional, Max 3 min) */}
              {!videoUri ? (
                <TouchableOpacity
                  style={styles.mediaCard}
                  onPress={() => setCaptureTarget('video')}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <VideoIcon size={28} color="#2563EB" />
                  </View>
                  <Text style={styles.emptyCardText}>Record video</Text>
                  <Text style={styles.emptyCardSubtext}> Max 3 min</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.mediaCard, styles.mediaCardSuccess]}>
                  <View style={styles.videoSuccessBadge}>
                    <View style={styles.videoPlayCircle}>
                      <VideoIcon size={24} color="#16a34a" />
                    </View>
                    <Text style={styles.videoSuccessTitle}>Video Attached Successfully</Text>
                    {/* <Text style={styles.videoSuccessSubtitle}>Ready for submission (Optional • Max 3 min)</Text> */}
                  </View>
                  <View style={styles.mediaCardActions}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={() => setCaptureTarget('video')}
                      activeOpacity={0.7}
                    >
                      <VideoIcon size={14} color="#2563EB" />
                      <Text style={styles.retakeBtnText}>Change Video</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeMediaBtn}
                      onPress={() => {
                        setVideoUri(null);
                        setVideoDuration(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.removeMediaBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Legal Compliance & Safety Callout */}
            {/* <View style={styles.complianceBox}>
              <ShieldCheckIcon size={18} color="#1e40af" />
              <Text style={styles.complianceText}>
                Submission hashes the tally cryptographically to the central collation server. Ensure all accredited party agents have witnessed the vote entries.
              </Text>
            </View> */}

            {/* Primary Submission Button - Strictly disabled unless both photos are attached */}
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
                  <Text style={styles.submitBtnText}>Submit</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* <Text style={styles.confirmationHint}>
              {!isSubmissionReady
                ? "⚠️ 2 photos are mandatory before submitting (Video is optional)"
                : "Requires booth officer confirmation"}
            </Text> */}
          </View>
        }
      />

      {/* Media Capture & Selection Modal Window (Camera vs Gallery / File Browser) */}
      <Modal
        visible={Boolean(captureTarget)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCaptureTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCaptureTarget(null)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {captureTarget === 'photo1'
                  ? 'Photo 1'
                  : captureTarget === 'photo2'
                  ? 'Photo 2'
                  : 'Video'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {captureTarget === 'video'
                  ? 'Record via camera or select video from device (Max 3 min)'
                  : 'Take photo via camera or select photo from device gallery'}
              </Text>
            </View>

            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOptionBtn}
                onPress={() => handleCaptureOption('camera')}
                activeOpacity={0.7}
              >
                <View style={styles.modalOptionIconCircle}>
                  {captureTarget === 'video' ? (
                    <VideoIcon size={22} color="#1e40af" />
                  ) : (
                    <CameraIcon size={22} color="#1e40af" />
                  )}
                </View>
                <View style={styles.modalOptionTextCol}>
                  <Text style={styles.modalOptionTitle}>
                    {captureTarget === 'video' ? 'Record with Camera' : 'Take Photo with Camera'}
                  </Text>
                  <Text style={styles.modalOptionDesc}>
                    {captureTarget === 'video'
                      ? 'Launch camera to record video'
                      : 'Launch camera to capture clear photo'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOptionBtn}
                onPress={() => handleCaptureOption('gallery')}
                activeOpacity={0.7}
              >
                <View style={styles.modalOptionIconCircle}>
                  <GalleryIcon size={22} color="#1e40af" />
                </View>
                <View style={styles.modalOptionTextCol}>
                  <Text style={styles.modalOptionTitle}>
                    {captureTarget === 'video'
                      ? 'Choose Video from File Browser / Gallery'
                      : 'Choose Photo from File Browser / Gallery'}
                  </Text>
                  <Text style={styles.modalOptionDesc}>
                    {captureTarget === 'video'
                      ? 'Browse stored videos on this device (Videos only)'
                      : 'Browse stored photos on this device (Photos only)'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setCaptureTarget(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Task 4: Full-Screen Upload Progress Modal */}
      {/* <Modal */}
        {/* visible={submitting}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}} // Strictly prevent closing by back button while uploading */}
      {/* > */}
        {/* <View style={styles.progressModalBackdrop}>
          <View style={styles.progressModalCard}>
            <ActivityIndicator size="large" color="#2563EB" style={{ marginBottom: 14 }} />
            <Text style={styles.progressModalTitle}>Uploading to Server...</Text>
            <Text style={styles.progressPercentText}>{Math.min(100, uploadProgress)}%</Text> */}

            {/* Visual Progress Bar Track */}
            {/* <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, Math.max(0, uploadProgress))}%` },
                ]}
              />
            </View> */}

            {/* Warning Callout Box */}
            {/* <View style={styles.progressWarningBox}>
              <Text style={styles.progressWarningIcon}>⚠️</Text>
              <Text style={styles.progressWarningText}>
                Please keep the app open and do not switch screens until the upload finishes.
              </Text>
            </View>
          </View>
        </View>
      </Modal> */}

      {/* Task 4: Full-Screen Upload Progress Modal */}
      <Modal
        visible={submitting || uploadSuccess}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}} // Strictly prevent closing by back button while uploading
      >
        <View style={styles.progressModalBackdrop}>
          <View style={styles.progressModalCard}>
            
            {/* --- NEW CODE: Conditional rendering for Success UI vs Progress UI --- */}
            {uploadSuccess ? (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <View style={{ 
                  width: 72, height: 72, borderRadius: 36, 
                  backgroundColor: '#dcfce7', alignItems: 'center', 
                  justifyContent: 'center', marginBottom: 16 
                }}>
                  <Text style={{ fontSize: 36, fontWeight: '900', color: '#16a34a' }}>✓</Text>
                </View>
                <Text style={styles.progressModalTitle}>Upload Successful!</Text>
                <Text style={[styles.compressInfoText, { marginBottom: 24, fontSize: 14, color: '#334155' }]}>
                  Your photo/video evidence have been uploaded successfully.
                </Text>
                <TouchableOpacity 
                  style={[styles.submitBtn, { width: 140, height: 46 }]} 
                  onPress={() => {
                    setUploadSuccess(false);
                    // setSubmitting(false);
                    setUploadProgress(0);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ActivityIndicator size="large" color="#2563EB" style={{ marginBottom: 14 }} />
                <Text style={styles.progressModalTitle}>Uploading to Server...</Text>
                <Text style={styles.progressPercentText}>{Math.min(100, uploadProgress)}%</Text>

                {/* Visual Progress Bar Track */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, Math.max(0, uploadProgress))}%` },
                    ]}
                  />
                </View>

                {/* Warning Callout Box */}
                <View style={styles.progressWarningBox}>
                  <Text style={styles.progressWarningIcon}>⚠️</Text>
                  <Text style={styles.progressWarningText}>
                    Please keep the app open and do not switch screens until the upload finishes.
                  </Text>
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>

      {/* Task 2: Video Compression Modal */}
      <Modal
        visible={compressingVideo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.progressModalBackdrop}>
          <View style={styles.progressModalCard}>
            <ActivityIndicator size="large" color="#059669" style={{ marginBottom: 14 }} />
            <Text style={styles.progressModalTitle}>Compressing Video...</Text>
            {compressionProgress > 0 ? (
              <Text style={styles.compressPercentText}>{compressionProgress}%</Text>
            ) : (
              <Text style={styles.compressSubtitleText}>Analyzing video stream...</Text>
            )}

            {/* Visual Progress Bar Track */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.compressProgressBarFill,
                  { width: `${Math.min(100, Math.max(0, compressionProgress || 15))}%` },
                ]}
              />
            </View>

            {/* <Text style={styles.compressInfoText}>
              Optimizing video resolution (720p) for high-speed transmission to server. Please wait...
            </Text> */}
          </View>
        </View>
      </Modal>
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
    width: '100%',
  },
  listContentTablet: {
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 24,
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
    width: '100%',
  },
  candidateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  partyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
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
    marginRight: 10,
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
    gap: 4,
    flexShrink: 0,
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
    width: 54,
    minWidth: 46,
    maxWidth: 64,
    height: 42,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    padding: 0,
  },
  footer: {
    marginTop: 8,
    width: '100%',
  },
  mediaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 6,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  mediaTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  mediaCardTablet: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  mediaCardSmall: {
    paddingVertical: 22,
    paddingHorizontal: 12,
  },
  iconCircle: {
    backgroundColor: '#EFF6FF',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyCardText: {
    color: '#334155',
    fontSize: 15.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  mediaPreview: {
    width: '100%',
    maxHeight: 520,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  videoPreview: {
    width: '100%',
    height: 220,
    maxHeight: 380,
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
    maxWidth: '90%',
  },
  retakeBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flexShrink: 1,
  },
  requiredSubtext: {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 2,
    fontWeight: '600',
  },
  optionalSubtext: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  mediaCardSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  videoSuccessBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  videoPlayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  videoSuccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    textAlign: 'center',
  },
  videoSuccessSubtitle: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 2,
    textAlign: 'center',
  },
  mediaCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  removeMediaBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
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
    width: '100%',
  },
  complianceText: {
    flex: 1,
    fontSize: 11.5,
    color: '#444653',
    lineHeight: 16.5,
  },
  submitBtn: {
    height: 50,
    width: '100%',
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
    marginTop: 8,
    paddingHorizontal: 8,
    lineHeight: 16,
  },
  emptyCardSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOptions: {
    gap: 12,
    marginBottom: 16,
  },
  modalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  modalOptionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalOptionTextCol: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  modalCancelBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginTop: 4,
  },
  modalCancelBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#475569',
  },
  progressModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  progressModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressPercentText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2563EB',
    marginBottom: 16,
  },
  compressPercentText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#059669',
    marginBottom: 16,
  },
  compressSubtitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
  },
  progressBarTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 5,
  },
  compressProgressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 5,
  },
  progressWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '100%',
  },
  progressWarningIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  progressWarningText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#92400e',
    lineHeight: 17,
  },
  compressInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 17,
  },
});

