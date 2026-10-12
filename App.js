import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './src/components/Header';
import LoginScreen from './src/screens/LoginScreen';
import LocationSelectScreen from './src/screens/LocationSelectScreen';
import VoteSubmissionScreen from './src/screens/VoteSubmissionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS } from './src/theme';
import { setAuthToken } from './src/api/client';

import WalkthroughScreen from './src/screens/WalkthroughScreen';

export default function App() {
  const [operator, setOperator] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore authenticated session from AsyncStorage on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedOperator = await AsyncStorage.getItem('auth_operator');
        const storedBooth = await AsyncStorage.getItem('auth_booth');

        if (storedToken && storedOperator) {
          await setAuthToken(storedToken);
          const parsedOperator = JSON.parse(storedOperator);
          setOperator(parsedOperator);

          if (storedBooth) {
            setSelectedBooth(JSON.parse(storedBooth));
          } else if (parsedOperator.assigned_booth_id) {
            setSelectedBooth({
              booth_id: parsedOperator.assigned_booth_id,
              unique_booth_code: parsedOperator.unique_booth_code,
              booth_name: parsedOperator.booth_name,
            });
          }
          // Logged-in user: do not show walkthrough
          setShowWalkthrough(false);
        } else {
          // Logged-out user: show walkthrough
          setShowWalkthrough(true);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogout = async () => {
    await setAuthToken(null);
    try {
      await AsyncStorage.multiRemove(['auth_token', 'auth_operator', 'auth_booth']);
    } catch (err) {
      console.error('Failed to clear stored session:', err);
    }
    setOperator(null);
    setSelectedBooth(null);
    setShowProfile(false);
    setShowWalkthrough(true);
  };

  const handleLoginSuccess = async (opData) => {
    setOperator(opData);
    setShowWalkthrough(false);
    try {
      await AsyncStorage.setItem('auth_operator', JSON.stringify(opData));
    } catch (err) {
      console.error('Failed to persist operator data:', err);
    }

    if (opData.assigned_booth_id) {
      const booth = {
        booth_id: opData.assigned_booth_id,
        unique_booth_code: opData.unique_booth_code,
        booth_name: opData.booth_name,
      };
      setSelectedBooth(booth);
      try {
        await AsyncStorage.setItem('auth_booth', JSON.stringify(booth));
      } catch (err) {
        console.error('Failed to persist booth data:', err);
      }
    }
  };

  const handleBoothSelected = async (booth) => {
    setSelectedBooth(booth);
    try {
      if (booth) {
        await AsyncStorage.setItem('auth_booth', JSON.stringify(booth));
      } else {
        await AsyncStorage.removeItem('auth_booth');
      }
    } catch (err) {
      console.error('Failed to update stored booth:', err);
    }
  };

  const handleUpdateOperator = async (updatedFields) => {
    setOperator((prev) => {
      const updated = { ...prev, ...updatedFields };
      AsyncStorage.setItem('auth_operator', JSON.stringify(updated)).catch((err) =>
        console.error('Failed to update stored operator:', err)
      );
      return updated;
    });
  };

  if (isInitializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary || '#1e40af'} />
      </View>
    );
  }

  // 1. Show Walkthrough Screen if user is logged out
  if (!operator && showWalkthrough) {
    return <WalkthroughScreen onDone={() => setShowWalkthrough(false)} />;
  }

  // 2. Show Login Screen if unauthenticated
  if (!operator) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Main App Container
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
          handleBoothSelected(null);
        } : undefined}
      />
      {/* Conditional Screen Display */}
      {showProfile ? (
        <ProfileScreen
          operator={operator}
          selectedBooth={selectedBooth}
          onUpdateOperator={handleUpdateOperator}
          onBack={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      ) : !selectedBooth ? (
        <LocationSelectScreen onBoothSelected={handleBoothSelected} />
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