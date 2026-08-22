import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Award, ArrowLeft, TrendingUp, CheckCircle, FileText } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { ExamResultItem } from '../../types';
import { Badge } from '../../components/common/Badge';

export const ParentAcademicScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { selectedChild } = useAuth();
  const [results, setResults] = useState<ExamResultItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!selectedChild) return;
    const data = await DataService.getExamResults(selectedChild.id);
    setResults(data);
  };

  useEffect(() => {
    loadData();
  }, [selectedChild?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Academic Progress & Grades</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        <View style={styles.childBadge}>
          <Text style={styles.childBadgeLabel}>Showing performance record for:</Text>
          <Text style={styles.childBadgeName}>{selectedChild?.name || 'Selected Child'} ({selectedChild?.enrollmentNo})</Text>
        </View>

        {results.map((sem) => (
          <View key={sem.id} style={styles.semCard}>
            <View style={styles.semHeader}>
              <View>
                <Text style={styles.semTitle}>Semester {sem.semesterNumber}</Text>
                <Text style={styles.semSession}>{sem.examSession}</Text>
              </View>
              <Badge label={sem.status} variant="success" size="sm" />
            </View>

            <View style={styles.gpaPillRow}>
              <View style={styles.gpaPill}>
                <Text style={styles.gpaPillLabel}>SGPA: </Text>
                <Text style={styles.gpaPillVal}>{sem.sgpa.toFixed(2)}</Text>
              </View>
              <View style={styles.gpaPill}>
                <Text style={styles.gpaPillLabel}>CGPA: </Text>
                <Text style={styles.gpaPillVal}>{sem.cgpa.toFixed(2)}</Text>
              </View>
              <View style={styles.gpaPill}>
                <Text style={styles.gpaPillLabel}>Backlogs: </Text>
                <Text style={styles.gpaPillVal}>{sem.backlogs}</Text>
              </View>
            </View>

            <View style={styles.subjectsTable}>
              {sem.subjects.map((s) => (
                <View key={s.code} style={styles.subjectRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subCodeText}>{s.code}</Text>
                    <Text style={styles.subNameText}>{s.name}</Text>
                  </View>
                  <View style={styles.subScoreBox}>
                    <Text style={styles.gradeText}>{s.grade}</Text>
                    <Text style={styles.scoreText}>{s.totalMarks}/{s.maxMarks}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
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
  childBadge: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  childBadgeLabel: {
    fontSize: 10,
    color: THEME.colors.primaryLight,
    textTransform: 'uppercase',
    fontWeight: THEME.typography.weights.bold,
  },
  childBadgeName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
    marginTop: 2,
  },
  semCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
    ...THEME.shadows.sm,
  },
  semHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  semTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  semSession: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  gpaPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  gpaPill: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  gpaPillLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  gpaPillVal: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  subjectsTable: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  subCodeText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
  },
  subNameText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.text,
    marginTop: 1,
  },
  subScoreBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: '#1E40AF',
  },
  scoreText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
});
