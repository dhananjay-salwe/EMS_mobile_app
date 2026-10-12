import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

// --- Custom Pure React Native Graphics ---
const VoteGraphic = ({ size = 64, color = '#1e40af' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Paper entering box */}
    <View style={{ width: size * 0.35, height: size * 0.25, borderWidth: 4, borderColor: color, borderBottomWidth: 0, marginTop: -size * 0.1 }} />
    {/* Ballot Box */}
    <View style={{ width: size * 0.7, height: size * 0.5, borderWidth: 4, borderColor: color, borderRadius: 8, alignItems: 'center' }}>
      <View style={{ width: size * 0.45, height: 4, backgroundColor: color, borderRadius: 2, marginTop: 8 }} />
    </View>
  </View>
);

const PlantLeafGraphic = ({ size = 64, color = '#1e40af' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Leaf Body (Teardrop pointing up) */}
    <View style={{
      width: size * 0.55,
      height: size * 0.55,
      borderWidth: 4,
      borderColor: color,
      borderTopLeftRadius: 4, // Sharp tip
      borderTopRightRadius: size * 0.275, // Rounded side
      borderBottomLeftRadius: size * 0.275, // Rounded side
      borderBottomRightRadius: size * 0.275, // Rounded bottom
      transform: [{ rotate: '45deg' }],
      zIndex: 2,
    }} />
    {/* Stem & Central Vein */}
    <View style={{
      position: 'absolute',
      width: 4,
      height: size * 0.65,
      backgroundColor: color,
      bottom: size * 0.1,
      borderRadius: 2,
      zIndex: 1,
    }} />
  </View>
);

const SecureShieldGraphic = ({ size = 64, color = '#1e40af' }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Shield Outline */}
    <View style={{ width: size * 0.65, height: size * 0.75, borderWidth: 4, borderColor: color, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: size * 0.35, borderBottomRightRadius: size * 0.35, alignItems: 'center', justifyContent: 'center' }}>
      {/* Lock Shackle */}
      <View style={{ width: size * 0.22, height: size * 0.15, borderWidth: 3, borderColor: color, borderTopLeftRadius: size * 0.11, borderTopRightRadius: size * 0.11, borderBottomWidth: 0, marginBottom: -2 }} />
      {/* Lock Body */}
      <View style={{ width: size * 0.32, height: size * 0.22, backgroundColor: color, borderRadius: 4 }} />
    </View>
  </View>
);

// --- Updated Slides Data ---

const SLIDES = [
  {
    id: '1',
    title: 'Digital Monitoring',
    description: 'Transition seamlessly from physical logbooks to an automated digital Election Monitoring System.',
    icon: <VoteGraphic color="#1e40af" size={68} />,
  },
  {
    id: '2',
    title: 'Go-Green Elections',
    description: 'Record polling events, capture evidence, and submit reports digitally in real time.',
    icon: <PlantLeafGraphic color="#1e40af" size={68} />,
  },
  {
    id: '3',
    title: 'Secure Polling Data',
    description: 'Securely submit encrypted polling data for faster monitoring and reliable election results.',
    icon: <SecureShieldGraphic color="#1e40af" size={68} />,
  },
];

export default function WalkthroughScreen({ onDone }) {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setCurrentIndex(index);
  };

  const completeWalkthrough = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWalkthrough', 'true');
    } catch (error) {
      console.error('Failed to save walkthrough state:', error);
    }
    if (onDone) onDone();
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeWalkthrough();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f6f9" />
      {/* Top Skip Button */}
      <View style={styles.topBar}>
        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={completeWalkthrough} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Swipeable Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconCircle}>{item.icon}</View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Bottom Controls: Dots & Action Button */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.actionButtonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f9',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757684',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#131b2e',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#444653',
    textAlign: 'center',
    maxWidth: 340,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 28 : 36,
    gap: 20,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#1e40af',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#cbd5e1',
  },
  actionButton: {
    height: 50,
    backgroundColor: '#1e40af',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});