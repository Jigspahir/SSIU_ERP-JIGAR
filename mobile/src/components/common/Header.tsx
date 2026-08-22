import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, ChevronDown, User, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { ChildSelectorModal } from './ChildSelectorModal';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNotificationPress?: () => void;
  showChildSelector?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onNotificationPress,
  showChildSelector = false,
}) => {
  const { user, activeRole, selectedChild } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'S'}
            </Text>
          </View>
          <View>
            <Text style={styles.greetingText}>
              {title || `Welcome, ${user?.name?.split(' ')[0] || 'User'}`}
            </Text>
            <View style={styles.roleTag}>
              <ShieldCheck size={12} color={THEME.colors.accent} />
              <Text style={styles.roleText}>{activeRole || user?.role || 'STUDENT'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNotificationPress}
            style={styles.iconBtn}
          >
            <Bell size={20} color={THEME.colors.textInverse} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Parent Child Switcher Bar if active role is PARENT */}
      {showChildSelector && activeRole === 'PARENT' && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}
          style={styles.childBar}
        >
          <View style={styles.childBarLeft}>
            <Text style={styles.childBarLabel}>Active Student Record:</Text>
            <Text style={styles.childBarName}>
              {selectedChild?.name || 'Select Child'} ({selectedChild?.enrollmentNo || 'N/A'})
            </Text>
          </View>
          <View style={styles.switchPill}>
            <Text style={styles.switchPillText}>Switch</Text>
            <ChevronDown size={14} color={THEME.colors.primary} />
          </View>
        </TouchableOpacity>
      )}

      {activeRole === 'PARENT' && (
        <ChildSelectorModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: THEME.spacing.base,
    borderBottomLeftRadius: THEME.borderRadius.xl,
    borderBottomRightRadius: THEME.borderRadius.xl,
    ...THEME.shadows.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: '#78350F',
  },
  greetingText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textInverse,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  roleText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.accentLight,
    fontWeight: THEME.typography.weights.medium,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.orange,
  },
  childBar: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  childBarLeft: {
    flex: 1,
  },
  childBarLabel: {
    fontSize: 10,
    color: THEME.colors.accentLight,
    textTransform: 'uppercase',
    fontWeight: THEME.typography.weights.semibold,
  },
  childBarName: {
    fontSize: THEME.typography.sizes.sm,
    color: '#FFFFFF',
    fontWeight: THEME.typography.weights.bold,
    marginTop: 1,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
  },
  switchPillText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
});
