import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import Header from './src/components/Header';
import LoginScreen from './src/screens/LoginScreen';
import LocationSelectScreen from './src/screens/LocationSelectScreen';
import VoteSubmissionScreen from './src/screens/VoteSubmissionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS } from './src/theme';
import { setAuthToken } from './src/api/client';

export default function App() {
  const [operator, setOperator] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

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