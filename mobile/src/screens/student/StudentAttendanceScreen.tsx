import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Info, Calendar } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { AttendanceSummary } from '../../types';
import { Badge } from '../../components/common/Badge';

export const StudentAttendanceScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const studentId = route?.params?.studentId;
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await DataService.getAttendance(studentId);
    setAttendance(data);
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 80) return { label: 'Good', variant: 'success' as const };
    if (percentage >= 75) return { label: 'Eligible', variant: 'info' as const };
    return { label: 'Defaulter Risk', variant: 'danger' as const };
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Attendance Record</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Overall Percentage Card */}
        <View style={styles.summaryCard}>
          <View style={styles.gaugeContainer}>
            <Text style={styles.gaugeValue}>{attendance?.overallPercentage || 86.4}%</Text>
            <Text style={styles.gaugeLabel}>Overall Attendance</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{attendance?.totalPresent || 152}</Text>
              <Text style={styles.statTitle}>Present</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>
                {(attendance?.totalConducted || 176) - (attendance?.totalPresent || 152)}
              </Text>
              <Text style={styles.statTitle}>Absent</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{attendance?.totalConducted || 176}</Text>
              <Text style={styles.statTitle}>Conducted</Text>
            </View>
          </View>

          <View style={styles.eligibilityBanner}>
            <CheckCircle2 size={16} color="#059669" />
            <Text style={styles.eligibilityText}>
              Eligible for University End-Semester Examinations (Threshold: 75%)
            </Text>
          </View>
        </View>

        {/* Subject-Wise Attendance List */}
        <Text style={styles.sectionHeader}>Subject-wise Attendance</Text>

        {attendance?.records.map((record) => {
          const badge = getStatusBadge(record.percentage);
          return (
            <View key={record.id} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subjectCode}>{record.subjectCode}</Text>
                  <Text style={styles.subjectName}>{record.subjectName}</Text>
                  <Text style={styles.facultyName}>Faculty: {record.facultyName}</Text>
                </View>
                <Badge label={badge.label} variant={badge.variant} size="sm" />
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(record.percentage, 100)}%`,
                      backgroundColor:
                        record.percentage >= 75 ? THEME.colors.success : THEME.colors.danger,
                    },
                  ]}
                />
              </View>

              <View style={styles.sessionFooter}>
                <Text style={styles.sessionText}>
                  Attended: {record.attendedSessions} / {record.totalSessions} sessions
                </Text>
                <Text
                  style={[
                    styles.percentText,
                    {
                      color:
                        record.percentage >= 75 ? THEME.colors.success : THEME.colors.danger,
                    },
                  ]}
                >
                  {record.percentage}%
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  topTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  gaugeContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  gaugeValue: {
    fontSize: 42,
    fontWeight: THEME.typography.weights.black,
    color: THEME.colors.primary,
  },
  gaugeLabel: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  statTitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  eligibilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
    marginTop: 4,
  },
  eligibilityText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: THEME.typography.weights.semibold,
    flex: 1,
  },
  sectionHeader: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  subjectCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  subjectCode: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
    textTransform: 'uppercase',
  },
  subjectName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginTop: 2,
  },
  facultyName: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  percentText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
  },
});
