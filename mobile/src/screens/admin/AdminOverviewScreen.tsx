import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { ShieldCheck, Users, Building, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/dashboard/StatCard';
import { RecentActivityList } from '../../components/dashboard/RecentActivityList';
import { DataService } from '../../services/dataService';
import { ERPNotificationItem } from '../../types';

export const AdminOverviewScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<ERPNotificationItem[]>([]);

  const loadData = async () => {
    const notifs = await DataService.getNotifications();
    setNotifications(notifs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => navigation.navigate('NotificationsTab')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        <View style={styles.adminCard}>
          <Text style={styles.adminTitle}>{user?.name || 'University Executive'}</Text>
          <Text style={styles.adminRole}>{user?.role || 'SUPER_ADMIN'} • Administrative Mobile Console</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Active Students"
            value="4,850"
            subtitle="Across 12 Institutes"
            icon={<Users size={20} color="#0284C7" />}
            iconBgColor="#E0F2FE"
          />
          <View style={{ width: 12 }} />
          <StatCard
            title="Faculty & Staff"
            value="380"
            subtitle="Teaching & Admin"
            icon={<Building size={20} color="#7C3AED" />}
            iconBgColor="#EDE9FE"
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Avg Attendance"
            value="84.2%"
            subtitle="University Wide"
            icon={<TrendingUp size={20} color="#059669" />}
            iconBgColor="#D1FAE5"
          />
          <View style={{ width: 12 }} />
          <StatCard
            title="Pending Requests"
            value="18"
            subtitle="Across Offices"
            icon={<FileCheck size={20} color="#D97706" />}
            iconBgColor="#FEF3C7"
          />
        </View>

        <RecentActivityList
          notifications={notifications}
          onViewAll={() => navigation.navigate('NotificationsTab')}
          onItemPress={(item) => navigation.navigate('NotificationDetail', { notification: item })}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  adminCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  adminTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  adminRole: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    fontWeight: THEME.typography.weights.semibold,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
});
