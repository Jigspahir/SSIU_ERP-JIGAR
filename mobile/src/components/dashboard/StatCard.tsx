import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onPress?: () => void;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = THEME.colors.primaryLight,
  onPress,
  badge,
  style,
}) => {
  const content = (
    <>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        {badge && (
          <View
            style={[
              styles.badge,
              badge.variant === 'success' && styles.badgeSuccess,
              badge.variant === 'warning' && styles.badgeWarning,
              badge.variant === 'danger' && styles.badgeDanger,
              badge.variant === 'info' && styles.badgeInfo,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                badge.variant === 'success' && { color: '#065F46' },
                badge.variant === 'warning' && { color: '#92400E' },
                badge.variant === 'danger' && { color: '#991B1B' },
                badge.variant === 'info' && { color: '#1E40AF' },
              ]}
            >
              {badge.text}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.container, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.base,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minHeight: 115,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  title: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  badgeSuccess: {
    backgroundColor: THEME.colors.successLight,
  },
  badgeWarning: {
    backgroundColor: THEME.colors.warningLight,
  },
  badgeDanger: {
    backgroundColor: THEME.colors.dangerLight,
  },
  badgeInfo: {
    backgroundColor: THEME.colors.infoLight,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: THEME.typography.weights.bold,
    textTransform: 'uppercase',
  },
});
