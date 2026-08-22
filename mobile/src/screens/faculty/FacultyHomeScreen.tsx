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
  Users,
  Award,
  HelpCircle,
  Clock,
  BookOpen,
  ChevronRight,
  TrendingUp,
  FileCheck,
  FileText,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickActionGrid, QuickActionItem } from '../../components/dashboard/QuickActionGrid';
import { RecentActivityList } from '../../components/dashboard/RecentActivityList';
import { DataService } from '../../services/dataService';
import { ERPNotificationItem } from '../../types';

export const FacultyHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, setActiveRole } = useAuth();
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

  const quickActions: QuickActionItem[] = [
    {
      id: 'f-mark-att',
      title: 'Attendance',
      icon: <CalendarCheck size={24} color="#059669" />,
      bgColor: '#D1FAE5',
      onPress: () => navigation.navigate('FacultyAttendance'),
    },
    {
      id: 'f-students',
      title: 'My Students',
      icon: <Users size={24} color="#0284C7" />,
      bgColor: '#E0F2FE',
      onPress: () => navigation.navigate('FacultyStudents'),
    },
    {
      id: 'f-asg',
      title: 'Assignments',
      icon: <BookOpen size={24} color="#0891B2" />,
      bgColor: '#CFFAFE',
      onPress: () => navigation.navigate('FacultyAssignments'),
    },
    {
      id: 'f-exam',
      title: 'Examination',
      icon: <Award size={24} color="#2563EB" />,
      bgColor: '#DBEAFE',
      onPress: () => navigation.navigate('FacultyExam'),
    },
    {
      id: 'f-ptm',
      title: 'PTM Schedule',
      icon: <Clock size={24} color="#D97706" />,
      bgColor: '#FEF3C7',
      onPress: () => navigation.navigate('FacultyPTM'),
    },
    {
      id: 'f-requests',
      title: 'Student Requests',
      icon: <HelpCircle size={24} color="#7C3AED" />,
      bgColor: '#EDE9FE',
      badgeCount: 2,
      onPress: () => navigation.navigate('FacultyRequests'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => navigation.navigate('NotificationsTab')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Faculty Profile Badge */}
        <View style={styles.profileCard}>
          <Text style={styles.name}>{user?.name || 'Dr. Priya Patel'}</Text>
          <Text style={styles.designation}>{user?.designation || 'Associate Professor'} • {user?.departmentName || 'Computer Engineering'}</Text>
          <Text style={styles.empId}>Employee ID: {user?.employeeId || 'EMP-FAC-101'}</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <StatCard
            title="Assigned Students"
            value="120"
            subtitle="Div A & Div B"
            icon={<Users size={20} color="#0284C7" />}
            iconBgColor="#E0F2FE"
            onPress={() => navigation.navigate('FacultyStudents')}
          />
          <View style={{ width: 12 }} />
          <StatCard
            title="Pending Requests"
            value="2"
            subtitle="Electives & Leave"
            icon={<HelpCircle size={20} color="#7C3AED" />}
            iconBgColor="#EDE9FE"
            badge={{ text: 'Action Req', variant: 'warning' }}
            onPress={() => navigation.navigate('FacultyRequests')}
          />
        </View>

        {/* Today's Teaching Sessions */}
        <Text style={styles.sectionTitle}>Today's Classes & Pending Attendance</Text>
        <View style={styles.lectureCard}>
          <View style={styles.lectureHeader}>
            <Text style={styles.lectureCode}>CE-501 • Lecture</Text>
            <Text style={styles.lectureTime}>10:00 AM - 11:00 AM</Text>
          </View>
          <Text style={styles.lectureTitle}>Design & Analysis of Algorithms</Text>
          <Text style={styles.lectureVenue}>Room 302, Academic Block A • Division A (60 Students)</Text>
          <TouchableOpacity
            style={styles.markAttBtn}
            onPress={() => navigation.navigate('FacultyAttendance')}
          >
            <CalendarCheck size={14} color="#FFFFFF" />
            <Text style={styles.markAttBtnText}>Mark Lecture Attendance</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <QuickActionGrid items={quickActions} title="Faculty Quick Actions" />

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
  designation: {
    fontSize: 12,
    color: THEME.colors.primaryLight,
    fontWeight: THEME.typography.weights.semibold,
    marginTop: 2,
  },
  empId: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  lectureCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lectureCode: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
  },
  lectureTime: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.accentDark,
  },
  lectureTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: 2,
  },
  lectureVenue: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  markAttBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  markAttBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
  },
});
