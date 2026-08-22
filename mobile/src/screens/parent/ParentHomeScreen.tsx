import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  CalendarCheck,
  Award,
  BookOpen,
  Users,
  CreditCard,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  UserX,
  FileText,
  MessageSquare,
  ShieldCheck,
  Activity,
  Send,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickActionGrid, QuickActionItem } from '../../components/dashboard/QuickActionGrid';
import { RecentActivityList } from '../../components/dashboard/RecentActivityList';
import { ChildSelectorModal } from '../../components/common/ChildSelectorModal';
import { DataService } from '../../services/dataService';
import { AttendanceSummary, PTMRecord, ERPNotificationItem, FeeSummary } from '../../types';
import { Button } from '../../components/common/Button';

export const ParentHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, linkedChildren, selectedChild, setSelectedChild } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [ptmRecords, setPtmRecords] = useState<PTMRecord[]>([]);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [notifications, setNotifications] = useState<ERPNotificationItem[]>([]);

  const loadData = async () => {
    if (!selectedChild) return;
    try {
      const [attData, ptmData, feeData, notifData] = await Promise.all([
        DataService.getAttendance(selectedChild.id),
        DataService.getPTMRecords('PARENT', selectedChild.id),
        DataService.getFeeSummary(selectedChild.id),
        DataService.getNotifications(),
      ]);
      setAttendance(attData);
      setPtmRecords(ptmData);
      setFeeSummary(feeData);
      setNotifications(notifData);
    } catch (e) {
      console.log('Error loading parent dashboard data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedChild?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ─── NO STUDENT LINKED STATE ────────────────────────────────────
  if (!linkedChildren || linkedChildren.length === 0 || !selectedChild) {
    return (
      <View style={styles.container}>
        <Header onNotificationPress={() => navigation.navigate('NotificationsTab')} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <UserX size={48} color={THEME.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Student Profile Linked</Text>
          <Text style={styles.emptyMessage}>
            Your guardian account is currently not associated with an enrolled student at Swarrnim University.
          </Text>
          <View style={styles.emptyHelpBox}>
            <Text style={styles.emptyHelpTitle}>How to Link Your Ward:</Text>
            <Text style={styles.emptyHelpStep}>
              1. Contact the Swarrnim University Student Section or Registrar Office.
            </Text>
            <Text style={styles.emptyHelpStep}>
              2. Provide your ward's Enrollment Number and registered guardian mobile number.
            </Text>
            <Text style={styles.emptyHelpStep}>
              3. Once verified in the ERP database, your ward's academic records will appear here immediately.
            </Text>
          </View>
          <Button
            title="Refresh Account Status"
            onPress={onRefresh}
            style={{ width: '100%', marginTop: 20 }}
          />
        </View>
      </View>
    );
  }

  const upcomingPTM = ptmRecords.find((p) => p.status === 'INVITED' || p.status === 'SCHEDULED');

  const childSectionActions: QuickActionItem[] = [
    {
      id: 'p-att',
      title: 'Attendance',
      icon: <CalendarCheck size={24} color="#059669" />,
      bgColor: '#D1FAE5',
      onPress: () => navigation.navigate('StudentAttendance', { studentId: selectedChild.id }),
    },
    {
      id: 'p-acad',
      title: 'Academics & CGPA',
      icon: <Award size={24} color="#2563EB" />,
      bgColor: '#DBEAFE',
      onPress: () => navigation.navigate('ParentAcademic'),
    },
    {
      id: 'p-exam',
      title: 'Examination',
      icon: <FileText size={24} color="#7C3AED" />,
      bgColor: '#EDE9FE',
      onPress: () => navigation.navigate('StudentExam', { studentId: selectedChild.id }),
    },
    {
      id: 'p-ptm',
      title: 'PTM & Remarks',
      icon: <Users size={24} color="#0284C7" />,
      bgColor: '#E0F2FE',
      onPress: () => navigation.navigate('ParentPTM'),
    },
    {
      id: 'p-diary',
      title: 'Student Diary',
      icon: <BookOpen size={24} color="#0891B2" />,
      bgColor: '#CFFAFE',
      onPress: () => navigation.navigate('StudentDiary', { studentId: selectedChild.id }),
    },
    {
      id: 'p-docs',
      title: 'Documents',
      icon: <ShieldCheck size={24} color="#D97706" />,
      bgColor: '#FEF3C7',
      onPress: () => navigation.navigate('StudentDocuments', { studentId: selectedChild.id }),
    },
    {
      id: 'p-fees',
      title: 'Fee Summary',
      icon: <CreditCard size={24} color="#059669" />,
      bgColor: '#D1FAE5',
      onPress: () => navigation.navigate('ParentFees'),
    },
    {
      id: 'p-req',
      title: 'Create Request',
      icon: <Send size={24} color="#2563EB" />,
      bgColor: '#DBEAFE',
      onPress: () => navigation.navigate('CreateRequest', { studentId: selectedChild.id }),
    },
    {
      id: 'p-grievance',
      title: 'Lodge Complaint',
      icon: <HelpCircle size={24} color="#DC2626" />,
      bgColor: '#FEE2E2',
      onPress: () => navigation.navigate('CreateComplaint', { studentId: selectedChild.id }),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        showChildSelector
        onNotificationPress={() => navigation.navigate('NotificationsTab')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Child Selector Button */}
        <View style={styles.selectorBar}>
          <Text style={styles.selectorLabel}>ACTIVE WARD / CHILD:</Text>
          <TouchableOpacity
            style={styles.selectorBtn}
            activeOpacity={0.8}
            onPress={() => setShowChildModal(true)}
          >
            <View style={styles.selectorBtnContent}>
              <View style={styles.childDot} />
              <Text style={styles.selectorBtnText}>{selectedChild.name}</Text>
              <Text style={styles.selectorSub}>({selectedChild.enrollmentNo})</Text>
            </View>
            <ChevronDown size={18} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Selected Child Profile Snapshot */}
        <View style={styles.childHeaderCard}>
          <View style={styles.childAvatar}>
            <Text style={styles.avatarLetter}>{selectedChild.name.charAt(0)}</Text>
          </View>
          <View style={styles.childDetails}>
            <Text style={styles.childName}>{selectedChild.name}</Text>
            <Text style={styles.childEnrollment}>
              Roll No: {selectedChild.enrollmentNo} • Sem {selectedChild.semesterNumber} • {selectedChild.divisionName}
            </Text>
            <Text style={styles.childProgram}>
              {selectedChild.programName}
            </Text>
            <Text style={styles.mentorContact}>
              Assigned Mentor: {selectedChild.mentorName || 'Prof. Ankit Mehta'}
            </Text>
          </View>
        </View>

        {/* Key Academic Metrics */}
        <View style={styles.statsRow}>
          <StatCard
            title="Ward Attendance"
            value={`${attendance?.overallPercentage || 86.4}%`}
            subtitle="152 / 176 sessions attended"
            icon={<CalendarCheck size={20} color="#059669" />}
            iconBgColor="#D1FAE5"
            badge={{
              text: (attendance?.overallPercentage || 86.4) >= 75 ? 'Regular' : 'Low Attendance',
              variant: (attendance?.overallPercentage || 86.4) >= 75 ? 'success' : 'danger',
            }}
            onPress={() => navigation.navigate('StudentAttendance', { studentId: selectedChild.id })}
          />
          <View style={{ width: 12 }} />
          <StatCard
            title="Current CGPA"
            value="8.62"
            subtitle="Cleared all subjects"
            icon={<TrendingUp size={20} color="#2563EB" />}
            iconBgColor="#DBEAFE"
            badge={{ text: 'First Class', variant: 'info' }}
            onPress={() => navigation.navigate('ParentAcademic')}
          />
        </View>

        {/* PTM Action Highlight Banner */}
        {upcomingPTM && (
          <View style={styles.ptmCard}>
            <View style={styles.ptmHeader}>
              <View style={styles.ptmTitleRow}>
                <Clock size={18} color="#FFFFFF" />
                <Text style={styles.ptmMainTitle}>Parent–Teacher Consultation</Text>
              </View>
              <View style={styles.ptmBadge}>
                <Text style={styles.ptmBadgeText}>{upcomingPTM.status}</Text>
              </View>
            </View>

            <Text style={styles.ptmDateTime}>
              📅 {upcomingPTM.date} • ⏰ {upcomingPTM.timeSlot} • Room: {upcomingPTM.venue || 'Room 304'}
            </Text>
            <Text style={styles.ptmFaculty}>
              Consultation with: {upcomingPTM.facultyName}
            </Text>

            <View style={styles.ptmButtonRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ParentPTM')}
                style={styles.ptmActionBtn}
              >
                <Text style={styles.ptmActionBtnText}>Respond / Reschedule</Text>
                <ChevronRight size={14} color={THEME.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Child Sections & Services Grid */}
        <QuickActionGrid items={childSectionActions} title="Child Portals & Quick Actions" />

        {/* Recent University Notices */}
        <RecentActivityList
          notifications={notifications}
          onViewAll={() => navigation.navigate('NotificationsTab')}
          onItemPress={(item) => navigation.navigate('NotificationDetail', { notification: item })}
        />
      </ScrollView>

      {/* Child Selector Modal */}
      <ChildSelectorModal
        visible={showChildModal}
        onClose={() => setShowChildModal(false)}
      />
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
  selectorBar: {
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectorBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.success,
    marginRight: 8,
  },
  selectorBtnText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  selectorSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginLeft: 6,
  },
  childHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.sm,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  childEnrollment: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primaryLight,
    marginTop: 2,
  },
  childProgram: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  mentorContact: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  ptmCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.md,
  },
  ptmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ptmTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ptmMainTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  ptmBadge: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  ptmBadgeText: {
    fontSize: 9,
    fontWeight: THEME.typography.weights.bold,
    color: '#78350F',
    textTransform: 'uppercase',
  },
  ptmDateTime: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.accentLight,
    marginTop: 2,
  },
  ptmFaculty: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  ptmButtonRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  ptmActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
    gap: 4,
  },
  ptmActionBtnText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  emptyHelpBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    width: '100%',
  },
  emptyHelpTitle: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
    marginBottom: 8,
  },
  emptyHelpStep: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
});
