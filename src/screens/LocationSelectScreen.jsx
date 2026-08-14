import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { apiCall } from '../api/client';
import { COLORS, RADIUS, SPACING, FONTS, SHADOW } from '../theme';

const STEPS = ['State', 'LGA', 'Ward', 'Booth'];

export default function LocationSelectScreen({ onBoothSelected }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cascading Selection States
  const [selectedState, setSelectedState] = useState(null);
  const [selectedLga, setSelectedLga] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const data = await apiCall('/locations/all');
    if (data.success) {
      setLocations(data.locations);
    }
    setLoading(false);
  };

  // Derive unique options based on selections
  const states = [...new Set(locations.map(item => item.state_name))];

  const lgas = selectedState
    ? [...new Set(locations.filter(i => i.state_name === selectedState).map(i => i.lga_name))]
    : [];

  const wards = selectedLga
    ? [...new Set(locations.filter(i => i.state_name === selectedState && i.lga_name === selectedLga).map(i => i.ward_name))]
    : [];

  const booths = selectedWard
    ? locations.filter(i => i.state_name === selectedState && i.lga_name === selectedLga && i.ward_name === selectedWard)
    : [];

  const currentStepIndex = selectedWard ? 3 : selectedLga ? 2 : selectedState ? 1 : 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Select assigned polling unit</Text>
      <Text style={styles.subheading}>Filter through the region hierarchy to select your booth</Text>

      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepBarItem}>
            <View style={[styles.stepDot, i <= currentStepIndex && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, i <= currentStepIndex && styles.stepDotTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepBarLabel, i <= currentStepIndex && styles.stepBarLabelActive]}>{s}</Text>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < currentStepIndex && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      {/* 1. SELECT STATE */}
      {!selectedState && (
        <View style={{ flex: 1 }}>
          <Text style={styles.stepTitle}>Step 1 · Select state</Text>
          <FlatList
            data={states}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemCard} onPress={() => setSelectedState(item)} activeOpacity={0.75}>
                <Text style={styles.itemText}>{item}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 2. SELECT LGA */}
      {selectedState && !selectedLga && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedState(null)}>
            <Text style={styles.backLink}>‹ Back to states</Text>
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 2 · Select LGA ({selectedState})</Text>
          <FlatList
            data={lgas}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemCard} onPress={() => setSelectedLga(item)} activeOpacity={0.75}>
                <Text style={styles.itemText}>{item}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 3. SELECT WARD */}
      {selectedLga && !selectedWard && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedLga(null)}>
            <Text style={styles.backLink}>‹ Back to LGAs</Text>
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 3 · Select ward ({selectedLga})</Text>
          <FlatList
            data={wards}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemCard} onPress={() => setSelectedWard(item)} activeOpacity={0.75}>
                <Text style={styles.itemText}>{item}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 4. SELECT BOOTH */}
      {selectedWard && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedWard(null)}>
            <Text style={styles.backLink}>‹ Back to wards</Text>
          </TouchableOpacity>
          <Text style={styles.stepTitle}>Step 4 · Select polling unit ({selectedWard})</Text>
          <FlatList
            data={booths}
            keyExtractor={item => item.booth_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.itemCard, styles.boothCard]} onPress={() => onBoothSelected(item)} activeOpacity={0.75}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boothCode}>{item.unique_booth_code}</Text>
                  <Text style={styles.boothName}>{item.booth_name}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bodyBg, padding: SPACING.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bodyBg },
  heading: { fontSize: 19, fontWeight: '700', fontFamily: FONTS.bold, color: COLORS.textDark },
  subheading: { fontSize: 12.5, color: COLORS.textMuted, marginBottom: 16, marginTop: 3 },

  stepBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepBarItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: {
    width: 22, height: 22, borderRadius: RADIUS.pill,
    backgroundColor: '#eef0f4', alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepDotText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  stepDotTextActive: { color: COLORS.white },
  stepBarLabel: { fontSize: 10.5, color: COLORS.textMuted, marginLeft: 5, fontWeight: '600' },
  stepBarLabelActive: { color: COLORS.textDark },
  stepLine: { flex: 1, height: 2, backgroundColor: '#eef0f4', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: COLORS.primary },

  stepTitle: { fontSize: 14, fontWeight: '700', fontFamily: FONTS.semibold, color: COLORS.primary, marginBottom: 12 },
  backLink: { color: COLORS.primary, fontWeight: '700', fontFamily: FONTS.semibold, marginBottom: 12, fontSize: 13.5 },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: RADIUS.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  itemText: { flex: 1, fontSize: 15, fontWeight: '600', fontFamily: FONTS.medium, color: COLORS.textBody },
  chevron: { fontSize: 20, color: COLORS.textMuted },

  boothCard: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  boothCode: { fontSize: 14, fontWeight: '700', fontFamily: FONTS.bold, color: COLORS.primary },
  boothName: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});