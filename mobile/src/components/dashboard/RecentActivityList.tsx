import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Calendar, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { ERPNotificationItem } from '../../types';

interface RecentActivityListProps {
  notifications: ERPNotificationItem[];
  onViewAll?: () => void;
  onItemPress?: (item: ERPNotificationItem) => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  notifications,
  onViewAll,
  onItemPress,
}) => {
  const getIcon = (module: string) => {
    switch (module) {
      case 'ATTENDANCE':
        return <AlertCircle size={18} color="#D97706" />;
      case 'EXAM':
        return <Calendar size={18} color="#2563EB" />;
      case 'PTM':
        return <CheckCircle2 size={18} color="#059669" />;
      case 'REQUEST':
        return <FileCheck size={18} color="#7C3AED" />;
      default:
        return <Calendar size={18} color="#475569" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Updates & Alerts</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No recent updates at this moment.</Text>
        </View>
      ) : (
        notifications.slice(0, 4).map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => onItemPress && onItemPress(item)}
            style={[styles.itemCard, !item.isRead && styles.unreadCard]}
          >
            <View style={styles.iconCircle}>{getIcon(item.module)}</View>
            <View style={styles.content}>
              <Text style={[styles.itemTitle, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.itemTime}>{item.createdAt}</Text>
            </View>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  viewAllText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.bold,
  },
  emptyBox: {
    backgroundColor: THEME.colors.surface,
    padding: 20,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.sizes.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 8,
  },
  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 6,
  },
  itemTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.text,
  },
  unreadTitle: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.bold,
  },
  itemMessage: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  itemTime: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
