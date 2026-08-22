import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';

export interface QuickActionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  onPress: () => void;
  badgeCount?: number;
}

interface QuickActionGridProps {
  items: QuickActionItem[];
  title?: string;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({ items, title = 'Quick Services' }) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.75}
            onPress={item.onPress}
            style={styles.actionItem}
          >
            <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
              {item.icon}
              {!!item.badgeCount && item.badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badgeCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
    ...THEME.shadows.sm,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: THEME.typography.weights.bold,
  },
});
