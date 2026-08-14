import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';

const VARIANTS = {
  primary: { bg: COLORS.primary, text: COLORS.white, border: COLORS.primary },
  danger: { bg: COLORS.danger, text: COLORS.white, border: COLORS.danger },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
  secondary: { bg: '#eef0f4', text: COLORS.textBody, border: '#eef0f4' },
  dark: { bg: COLORS.textDark, text: COLORS.white, border: COLORS.textDark },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  small = false,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        small && styles.small,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[styles.text, small && styles.textSmall, { color: v.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  disabled: { opacity: 0.6 },
  text: {
    fontFamily: FONTS.semibold,
    fontWeight: '700',
    fontSize: 14.5,
  },
  textSmall: { fontSize: 12.5 },
});