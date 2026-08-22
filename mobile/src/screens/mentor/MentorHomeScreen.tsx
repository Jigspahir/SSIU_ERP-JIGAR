import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Users,
  AlertTriangle,
  Award,
  BookOpen,
  CalendarCheck,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  PhoneCall,
  Clock,
  FileCheck,
  MessageSquare,
  HelpCircle,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickActionGrid, QuickActionItem } from '../../components/dashboard/QuickActionGrid';
import { RecentActivityList } from '../../components/dashboard/RecentActivityList';
import { DataService } from '../../services/dataService';
import { ERPNotificationItem } from '../../types';

export const MentorHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [mentees, setMentees] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<ERPNotificationItem[]>([]);

  const loadData = async () => {
    const [menteeList, notifList] = await Promise.all([
      DataService.getMentorMentees(),
      DataService.getNotifications(),
    ]);
    setMentees(menteeList);
    setNotifications(notifList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const highRiskCount = mentees.filter((m) => m.riskLevel === 'HIGH').length;
  const attendanceRiskCount = mentees.filter((m) => m.attendancePercentage < 75).length;
  const academicRiskCount = mentees.filter((m) => m.cgpa < 6.5 || (m.riskFlags && m.riskFlags.length > 0)).length;

  const quickActions: QuickActionItem[] = [
    {
      id: 'm-mentees',
      title: 'My Mentees',
      icon: <Users size={24} color="#0284C7" />,
      bgColor: '#E0F2FE',
      onPress: () => navigation.navigate('MentorMentees'),
    },
    {
      id: 'm-risk',
      title: 'Risk Radar',
      icon: <AlertTriangle size={24} color="#DC2626" />,
      bgColor: '#FEE2E2',
      badgeCount: highRiskCount,
      onPress: () => navigation.navigate('MentorRisk'),
    },
    {
      id: 'm-counseling',
      title: 'Counseling Log',
      icon: <MessageSquare size={24} color="#059669" />,
      bgColor: '#D1FAE5',
      onPress: () => navigation.navigate('MentorCounseling'),
    },
    {
      id: 'm-doc-verify',
      title: 'Doc Verification',
      icon: <ShieldCheck size={24} color="#D97706" />,
      bgColor: '#FEF3C7',
      badgeCount: 2,
      onPress: () => navigation.navigate('MentorDocVerify'),
    },
    {
      id: 'm-requests',
      title: 'Mentee Requests',
      icon: <HelpCircle size={24} color="#7C3AED" />,
      bgColor: '#EDE9FE',
      badgeCount: 2,
      onPress: () => navigation.navigate('FacultyRequests'),
    },
    {
      id: 'm-ptm',
      title: 'PTM Schedule',
      icon: <Clock size={24} color="#0891B2" />,
      bgColor: '#CFFAFE',
      onPress: () => navigation.navigate('FacultyPTM'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => navigation.navigate('NotificationsTab')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Mentor Identity Badge */}
        <View style={styles.profileCard}>
          <Text style={styles.name}>{user?.name || 'Prof. Ankit Mehta'}</Text>
          <Text style={styles.roleTitle}>Senior Faculty Mentor • Dept of Computer Engineering</Text>
          <Text style={styles.assignedStats}>Assigned Mentoring Cohort: 24 Students (B.Tech CE Batch 2024-28)</Text>
        </View>

        {/* Core Indicators */}
        <View style={styles.statsRow}>
          <StatCard
            title="Total Mentees"
            value="24"
            subtitle="Semester 5 CE"
            icon={<Users size={20} color="#0284C7" />}
            iconBgColor="#E0F2FE"
            onPress={() => navigation.navigate('MentorMentees')}
          />
          <View style={{ width: 12 }} />
          <StatCard
            title="Attendance Risk"
            value={attendanceRiskCount}
            subtitle="Students < 75%"
            icon={<AlertTriangle size={20} color="#DC2626" />}
            iconBgColor="#FEE2E2"
            badge={{ text: 'Action Req', variant: 'danger' }}
            onPress={() => navigation.navigate('MentorRisk')}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Academic Risk"
            value={academicRiskCount}
            subtitle="Backlog / Remedial"
            icon={<TrendingDown size={20} color="#D97706" />}
            iconBgColor="#FEF3C7"
            badge={{ text: 'Remedial', variant: 'warning' }}
            onPress={() => navigation.navigate('MentorRisk')}
          />
          <View style={{ width: 12 }} />
          <StatCard
            title="Pending Docs"
            value="2"
            subtitle="Affidavits / Cards"
            icon={<FileCheck size={20} color="#059669" />}
            iconBgColor="#D1FAE5"
            onPress={() => navigation.navigate('MentorDocVerify')}
          />
        </View>

        {/* Early Warning Alert Banner */}
        {highRiskCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MentorRisk')}
          >
            <AlertTriangle size={22} color="#991B1B" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.alertTitle}>Early Warning: Critical Mentee Risk</Text>
              <Text style={styles.alertText}>
                Rohan Verma (24010101042) has 68.2% attendance & Mathematics backlog. Guardian phone follow-up initiated.
              </Text>
            </View>
            <ChevronRight size={16} color="#991B1B" />
          </TouchableOpacity>
        )}

        {/* Follow-up Actions Box */}
        <View style={styles.actionBox}>
          <Text style={styles.actionBoxHeader}>Pending Follow-up Actions</Text>
          <View style={styles.actionItem}>
            <View style={styles.actionDot} />
            <Text style={styles.actionText}>Review Rohan Verma's morning tutorial attendance attendance.</Text>
          </View>
          <View style={styles.actionItem}>
            <View style={styles.actionDot} />
            <Text style={styles.actionText}>Approve Diya Patel's Hackathon Incubation grant nomination.</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <QuickActionGrid items={quickActions} title="Mentor Dedicated Workspace" />

        {/* Recent Updates */}
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
  profileCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.sm,
  },
  name: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  roleTitle: {
    fontSize: 12,
    color: THEME.colors.primaryLight,
    fontWeight: THEME.typography.weights.semibold,
    marginTop: 2,
  },
  assignedStats: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    marginVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  alertText: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 15,
  },
  actionBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  actionBoxHeader: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
    marginRight: 8,
  },
  actionText: {
    fontSize: 11,
    color: THEME.colors.text,
    flex: 1,
  },
});
