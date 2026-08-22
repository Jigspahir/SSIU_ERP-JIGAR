import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Award, ArrowLeft, Calendar, FileText, CheckCircle, Download } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { ExamResultItem } from '../../types';
import { Badge } from '../../components/common/Badge';

export const StudentExamScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const studentId = route?.params?.studentId;
  const [results, setResults] = useState<ExamResultItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSem, setSelectedSem] = useState<number>(4);

  const loadData = async () => {
    const data = await DataService.getExamResults(studentId);
    setResults(data);
    if (data.length > 0) {
      setSelectedSem(data[0].semesterNumber);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeResult = results.find((r) => r.semesterNumber === selectedSem) || results[0];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Examination & Results</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Semester Selector Tabs */}
        <View style={styles.semTabs}>
          {results.map((res) => (
            <TouchableOpacity
              key={res.id}
              activeOpacity={0.8}
              onPress={() => setSelectedSem(res.semesterNumber)}
              style={[
                styles.semTabItem,
                selectedSem === res.semesterNumber && styles.activeSemTab,
              ]}
            >
              <Text
                style={[
                  styles.semTabText,
                  selectedSem === res.semesterNumber && styles.activeSemTabText,
                ]}
              >
                Semester {res.semesterNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeResult ? (
          <>
            {/* Grade / SGPA Highlight Card */}
            <View style={styles.resultOverviewCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{activeResult.examSession}</Text>
                <Badge label={activeResult.status} variant="success" size="sm" />
              </View>

              <View style={styles.gpaRow}>
                <View style={styles.gpaBox}>
                  <Text style={styles.gpaNumber}>{activeResult.sgpa.toFixed(2)}</Text>
                  <Text style={styles.gpaLabel}>Semester SGPA</Text>
                </View>
                <View style={styles.gpaDivider} />
                <View style={styles.gpaBox}>
                  <Text style={styles.gpaNumber}>{activeResult.cgpa.toFixed(2)}</Text>
                  <Text style={styles.gpaLabel}>Cumulative CGPA</Text>
                </View>
                <View style={styles.gpaDivider} />
                <View style={styles.gpaBox}>
                  <Text style={styles.gpaNumber}>{activeResult.backlogs}</Text>
                  <Text style={styles.gpaLabel}>Active Backlogs</Text>
                </View>
              </View>
            </View>

            {/* Subject Marks Ledger Table/Cards */}
            <Text style={styles.sectionHeading}>Subject Score Details</Text>

            {activeResult.subjects.map((sub) => (
              <View key={sub.code} style={styles.subScoreCard}>
                <View style={styles.subScoreHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subCode}>{sub.code} • {sub.credits} Credits</Text>
                    <Text style={styles.subName}>{sub.name}</Text>
                  </View>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{sub.grade}</Text>
                  </View>
                </View>

                <View style={styles.subMarksRow}>
                  <View style={styles.markItem}>
                    <Text style={styles.markLabel}>Internal</Text>
                    <Text style={styles.markVal}>{sub.internalMarks} / 30</Text>
                  </View>
                  <View style={styles.markItem}>
                    <Text style={styles.markLabel}>External</Text>
                    <Text style={styles.markVal}>{sub.externalMarks} / 70</Text>
                  </View>
                  <View style={styles.markItem}>
                    <Text style={styles.markLabel}>Total Score</Text>
                    <Text style={[styles.markVal, { fontWeight: '700', color: THEME.colors.primary }]}>
                      {sub.totalMarks} / {sub.maxMarks}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Award size={48} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Results Published Yet</Text>
            <Text style={styles.emptySubtitle}>Official grade ledger will appear once released by Exam Cell.</Text>
          </View>
        )}
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
  semTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    marginBottom: THEME.spacing.md,
  },
  semTabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  activeSemTab: {
    backgroundColor: THEME.colors.primary,
  },
  semTabText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  activeSemTabText: {
    color: '#FFFFFF',
  },
  resultOverviewCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.base,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.base,
    ...THEME.shadows.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
  },
  gpaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  gpaBox: {
    flex: 1,
    alignItems: 'center',
  },
  gpaNumber: {
    fontSize: 28,
    fontWeight: THEME.typography.weights.black,
    color: THEME.colors.primary,
  },
  gpaLabel: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  gpaDivider: {
    width: 1,
    height: 36,
    backgroundColor: THEME.colors.border,
  },
  sectionHeading: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  subScoreCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 8,
  },
  subScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subCode: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
  },
  subName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginTop: 2,
  },
  gradeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.bold,
    color: '#1E40AF',
  },
  subMarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: THEME.borderRadius.md,
  },
  markItem: {
    alignItems: 'center',
  },
  markLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  markVal: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.text,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
