import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS, SHADOW } from '../theme';

export default function Header({ operator, selectedBooth, onLogout, onChangeBooth }) {
  const initial = operator?.full_name ? operator.full_name.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>{operator.full_name}</Text>
          {selectedBooth ? (
            <View style={styles.boothBadge}>
              <Text style={styles.boothBadgeText} numberOfLines={1}>
                {selectedBooth.unique_booth_code} · {selectedBooth.booth_name}
              </Text>
            </View>
          ) : (
            <Text style={styles.noBooth}>No booth selected</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {selectedBooth && onChangeBooth && (
          <TouchableOpacity style={styles.changeBtn} onPress={onChangeBooth} activeOpacity={0.75}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.75}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOW,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textDark,
  },
  boothBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginTop: 4,
  },
  boothBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  noBooth: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  actions: { flexDirection: 'row', gap: 8 },
  changeBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  changeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: FONTS.semibold,
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontFamily: FONTS.semibold,
    fontSize: 12,
  },
});