import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../theme';

// Pure React Native Vector Icons (Zero Font Dependencies)
const LockIcon = ({ size = 11, color = '#64748b' }) => (
  <View style={{ width: size, height: size + 2, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.55,
        borderWidth: 1.4,
        borderColor: color,
        borderTopLeftRadius: size * 0.36,
        borderTopRightRadius: size * 0.36,
        borderBottomWidth: 0,
        marginBottom: -1,
      }}
    />
    <View
      style={{
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 1.2, height: 1.8, backgroundColor: '#ffffff', borderRadius: 0.6 }} />
    </View>
  </View>
);

const LogoutIcon = ({ size = 12, color = '#e11d48' }) => (
  <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.45,
        height: size * 0.85,
        borderWidth: 1.4,
        borderColor: color,
        borderRightWidth: 0,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
        marginRight: 2,
      }}
    />
    <View style={{ width: size * 0.45, height: 1.4, backgroundColor: color }} />
    <View
      style={{
        width: 3.5,
        height: 3.5,
        borderTopWidth: 1.4,
        borderRightWidth: 1.4,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginLeft: -2.5,
      }}
    />
  </View>
);

const VerifiedBadge = () => (
  <View
    style={{
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#2563eb',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color: '#ffffff', fontSize: 8.5, fontWeight: '900', marginTop: -1 }}>✓</Text>
  </View>
);

export default function Header({ operator, selectedBooth, onLogout, onChangeBooth, onOpenProfile }) {
  const initial = operator?.full_name ? operator.full_name.charAt(0).toUpperCase() : '?';
  const profilePic = operator?.profile_picture_url || operator?.profile_picture || operator?.avatar_url;

  return (
    <View style={styles.wrapper}>
      {/* Top Security Channel Bar */}
      {/* <View style={styles.topSecurityBar}>
        <View style={styles.statusLeft}>
          <View style={styles.pulsingDot} />
          <Text style={styles.statusText}>
            <Text style={{ fontWeight: '700' }}>BOOTH TERMINAL</Text> • Secure Channel
          </Text>
        </View>
        <View style={styles.statusRight}>
          <LockIcon size={11} color="#64748b" />
          <Text style={styles.sslText}>256-Bit SSL</Text>
        </View>
      </View> */}

      {/* Main Active Officer Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={onOpenProfile}
          activeOpacity={0.75}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            <View style={styles.onlineBadge} />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {operator.full_name}
              </Text>
              <VerifiedBadge />
            </View>
            {selectedBooth ? (
              <View style={styles.boothBadge}>
                <Text style={styles.boothBadgeText} numberOfLines={1}>
                  {selectedBooth.booth_name} • {selectedBooth.unique_booth_code}
                </Text>
              </View>
            ) : (
              <Text style={styles.noBooth}>No booth selected</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          {selectedBooth && onChangeBooth && (
            <TouchableOpacity style={styles.changeBtn} onPress={onChangeBooth} activeOpacity={0.75}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          )}
          {/* <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.75}>
            <LogoutIcon size={12} color="#e11d48" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topSecurityBar: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 10.5,
    color: '#475569',
    letterSpacing: 0.3,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sslText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#1d4ed8',
    fontWeight: '800',
    fontSize: 16,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  boothBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    marginTop: 3,
    maxWidth: '92%',
  },
  boothBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  noBooth: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeBtn: {
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  changeText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 11.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  logoutText: {
    color: '#e11d48',
    fontWeight: '700',
    fontSize: 11.5,
  },
});