import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import Header from './src/components/Header';
import LoginScreen from './src/screens/LoginScreen';
import LocationSelectScreen from './src/screens/LocationSelectScreen';
import VoteSubmissionScreen from './src/screens/VoteSubmissionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS } from './src/theme';
import { setAuthToken } from './src/api/client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import WalkthroughScreen from './src/screens/WalkthroughScreen';

const DEV_FORCE_WALKTHROUGH = true;

export default function App() {
  const [operator, setOperator] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  // useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     try {
  //       const value = await AsyncStorage.getItem('hasSeenWalkthrough');
  //       setIsFirstLaunch(value === null);
  //     } catch (e) {
  //       setIsFirstLaunch(false);
  //     }
  //   };
  //   checkFirstLaunch();
  // }, []);
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        if (__DEV__ && DEV_FORCE_WALKTHROUGH) {
          // Clears the saved flag so you can test fresh every time
          await AsyncStorage.removeItem('hasSeenWalkthrough');
          setIsFirstLaunch(true);
          return;
        }

        const value = await AsyncStorage.getItem('hasSeenWalkthrough');
        setIsFirstLaunch(value === null);
      } catch (e) {
        setIsFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setOperator(null);
    setSelectedBooth(null);
    setShowProfile(false);
  };

  const handleLoginSuccess = (opData) => {
    setOperator(opData);
    // If the backend returns an assigned booth, auto-select it to bypass the location screen!
    if (opData.assigned_booth_id) {
      setSelectedBooth({
        booth_id: opData.assigned_booth_id,
        unique_booth_code: opData.unique_booth_code,
        booth_name: opData.booth_name
      });
    }
  };

  const handleUpdateOperator = (updatedFields) => {
    setOperator((prev) => ({ ...prev, ...updatedFields }));
  };

  // While reading storage, return null or a simple ActivityIndicator
  if (isFirstLaunch === null) {
    return null;
  }

  // If first launch, show WalkthroughScreen
  if (isFirstLaunch) {
    return <WalkthroughScreen onDone={() => setIsFirstLaunch(false)} />;
  }

  // Existing logic continues below (operator === null ? <LoginScreen /> : ...)

  // 1. Show Login Screen if unauthenticated
  if (!operator) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Main App Container
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />
      <Header
        operator={operator}
        selectedBooth={selectedBooth}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfile(true)}
        // Only allow changing booths if they are NOT strictly assigned to one
        onChangeBooth={!operator.assigned_booth_id ? () => {
          setShowProfile(false);
          setSelectedBooth(null);
        } : undefined}
      />
      {/* 3. Conditional Screen Display */}
      {showProfile ? (
        <ProfileScreen
          operator={operator}
          selectedBooth={selectedBooth}
          onUpdateOperator={handleUpdateOperator}
          onBack={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      ) : !selectedBooth ? (
        <LocationSelectScreen onBoothSelected={setSelectedBooth} />
      ) : (
        <VoteSubmissionScreen operator={operator} selectedBooth={selectedBooth} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bodyBg,
    paddingTop: Platform.OS === 'android' ? 35 : 0
  },
});