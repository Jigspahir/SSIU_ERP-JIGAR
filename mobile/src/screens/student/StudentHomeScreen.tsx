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
  CalendarCheck,
  Award,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  Bell,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickActionGrid, QuickActionItem } from '../../components/dashboard/QuickActionGrid';
import { RecentActivityList } from '../../components/dashboard/RecentActivityList';
import { DataService } from '../../services/dataService';
import { AttendanceSummary, ExamResultItem, ERPNotificationItem } from '../../types';

export const StudentHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [results, setResults] = useState<ExamResultItem[]>([]);
  const [notifications, setNotifications] = useState<ERPNotificationItem[]>([]);

  const loadDashboardData = async () => {
    try {
      const [attData, resData, notifData] = await Promise.all([
        DataService.getAttendance(),
        DataService.getExamResults(),
        DataService.getNotifications(),
      ]);
      setAttendance(attData);
      setResults(resData);
      setNotifications(notifData);
    } catch (e) {
      console.log('Error loading student dashboard data', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions: QuickActionItem[] = [
    {
      id: 'att',
      title: 'Attendance',
      icon: <CalendarCheck size={24} color="#059669" />,
      bgColor: '#D1FAE5',
      onPress: () => navigation.navigate('StudentAttendance'),
    },
    {
      id: 'res',
      title: 'Results',
      icon: <Award size={24} color="#2563EB" />,
      bgColor: '#DBEAFE',
      onPress: () => navigation.navigate('StudentExam'),
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <FileText size={24} color="#0891B2" />,
      bgColor: '#CFFAFE',
      onPress: () => navigation.navigate('StudentAssignments'),
    },
    {
      id: 'ptm',
      title: 'PTM Schedule',
      icon: <Users size={24} color="#0284C7" />,
      bgColor: '#E0F2FE',
      onPress: () => navigation.navigate('StudentPTM'),
    },
    {
      id: 'diary',
      title: 'Student Diary',
      icon: <BookOpen size={24} color="#7C3AED" />,
      bgColor: '#EDE9FE',
      onPress: () => navigation.navigate('StudentDiary'),
    },
    {
      id: 'docs',
      title: 'Documents',
      icon: <FileText size={24} color="#D97706" />,
      bgColor: '#FEF3C7',
      onPress: () => navigation.navigate('StudentDocuments'),
    },
    {
      id: 'requests',
      title: 'Requests & Help',
      icon: <HelpCircle size={24} color="#DC2626" />,
      bgColor: '#FEE2E2',
      onPress: () => navigation.navigate('StudentRequests'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        onNotificationPress={() => navigation.navigate('NotificationsTab')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Student Profile Quick Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProfileTab')}
          style={styles.profileCard}
        >
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>{user?.name?.charAt(0) || 'A'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.studentName}>{user?.name || 'Aarav Sharma'}</Text>
            <Text style={styles.enrollmentNo}>
              Enrollment: {user?.enrollmentNo || '24010101001'}
            </Text>
            <Text style={styles.programName}>
              {user?.programName || 'B.Tech Computer Engineering'} • Sem 5
            </Text>
            <Text style={styles.instName}>
              {user?.instituteName || 'Swarrnim Institute of Technology'}
            </Text>
          </View>
          <View style={styles.badgeCol}>
            <View style={styles.badgeAbc}>
              <Sparkles size={11} color="#065F46" />
              <Text style={styles.badgeAbcText}>ABC Verified</Text>
            </View>
            <View style={[styles.badgeAbc, { backgroundColor: '#EFF6FF', marginTop: 4 }]}>
              <Text style={[styles.badgeAbcText, { color: '#1E40AF' }]}>Good Standing</Text>
            </View>
          </View>
        </TouchableOpacity>


        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Attendance Rate"
            value={`${attendance?.overallPercentage || 86.4}%`}
            subtitle="152 / 176 sessions"
            icon={<CalendarCheck size={20} color="#059669" />}
            iconBgColor="#D1FAE5"
            badge={{
              text: (attendance?.overallPercentage || 86.4) >= 75 ? 'Eligible' : 'Risk',
              variant: (attendance?.overallPercentage || 86.4) >= 75 ? 'success' : 'danger',
            }}
            onPress={() => navigation.navigate('StudentAttendance')}
          />
          <View style={{ width: 12 }} />
          <StatCard
            title="Cumulative CGPA"
            value="8.62"
            subtitle="0 Active Backlogs"
            icon={<TrendingUp size={20} color="#2563EB" />}
            iconBgColor="#DBEAFE"
            badge={{ text: 'First Class', variant: 'info' }}
            onPress={() => navigation.navigate('StudentExam')}
          />
        </View>

        {/* Quick Actions Grid */}
        <QuickActionGrid items={quickActions} title="Student Services & Portals" />

        {/* Upcoming Consultation Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('StudentPTM')}
          style={styles.ptmBanner}
        >
          <View style={styles.ptmIconCircle}>
            <Clock size={20} color="#FFFFFF" />
          </View>
          <View style={styles.ptmInfo}>
            <Text style={styles.ptmTitle}>Mid-Sem Parent–Teacher Meeting</Text>
            <Text style={styles.ptmTime}>March 25, 2025 • 10:30 AM • Room 304</Text>
          </View>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Recent Activity & Notices */}
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
    padding: THEME.spacing.base,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...THEME.shadows.sm,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: THEME.colors.accent,
  },
  avatarMiniText: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  enrollmentNo: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primaryLight,
    marginTop: 1,
  },
  programName: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  instName: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  badgeAbc: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    gap: 3,
  },

  badgeAbcText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: '#065F46',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  ptmBanner: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
    ...THEME.shadows.md,
  },
  ptmIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ptmInfo: {
    flex: 1,
  },
  ptmTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  ptmTime: {
    fontSize: 11,
    color: THEME.colors.accentLight,
    marginTop: 2,
  },
});
