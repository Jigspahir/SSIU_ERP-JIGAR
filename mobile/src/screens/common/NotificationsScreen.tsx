import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Bell, Calendar, CheckCircle2, AlertCircle, FileCheck, ChevronRight, CheckCheck } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { ERPNotificationItem } from '../../types';

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<ERPNotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await DataService.getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (module: string) => {
    switch (module) {
      case 'ATTENDANCE':
        return <AlertCircle size={20} color="#D97706" />;
      case 'EXAM':
        return <Calendar size={20} color="#2563EB" />;
      case 'PTM':
        return <CheckCircle2 size={20} color="#059669" />;
      case 'REQUEST':
        return <FileCheck size={20} color="#7C3AED" />;
      default:
        return <Bell size={20} color="#475569" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>University Notification Center</Text>
        <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
          <CheckCheck size={16} color={THEME.colors.accent} />
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('NotificationDetail', { notification: item })}
            style={[styles.itemCard, !item.isRead && styles.unreadCard]}
          >
            <View style={styles.iconCircle}>{getIcon(item.module)}</View>

            <View style={styles.content}>
              <View style={styles.itemHeader}>
                <Text style={styles.moduleTag}>{item.module}</Text>
                <Text style={styles.timeText}>{item.createdAt}</Text>
              </View>
              <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>
            </View>

            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topBar: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: THEME.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markReadText: {
    fontSize: 11,
    color: THEME.colors.accentLight,
    fontWeight: THEME.typography.weights.semibold,
  },
  listContent: {
    padding: THEME.spacing.base,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
    ...THEME.shadows.sm,
  },
  unreadCard: {
    backgroundColor: '#F8FAFF',
    borderColor: '#BFDBFE',
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  moduleTag: {
    fontSize: 9,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  title: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.text,
  },
  unreadTitle: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.bold,
  },
  message: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
