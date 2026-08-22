import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, UploadCloud, FileText } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

interface AssignmentItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  maxMarks: number;
  obtainedMarks?: number;
  description: string;
}

export const StudentAssignmentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED'>('ALL');

  const assignments: AssignmentItem[] = [
    {
      id: 'asg-1',
      title: 'Distributed System Consensus Algorithms (Raft & Paxos)',
      subjectCode: 'CE-501',
      subjectName: 'Distributed Systems',
      facultyName: 'Dr. Priya Patel',
      dueDate: 'Tomorrow, 11:59 PM',
      status: 'PENDING',
      maxMarks: 25,
      description: 'Implement a state-machine replication simulation and submit code repository with technical documentation report.',
    },
    {
      id: 'asg-2',
      title: 'Neural Network Hyperparameter Tuning & Dropout Experiment',
      subjectCode: 'CE-503',
      subjectName: 'Machine Learning',
      facultyName: 'Prof. Ankit Mehta',
      dueDate: 'Oct 28, 2025',
      status: 'SUBMITTED',
      maxMarks: 30,
      obtainedMarks: 28,
      description: 'Run PyTorch image classification benchmarks comparing Adam vs SGD optimizers across learning rates.',
    },
    {
      id: 'asg-3',
      title: 'Relational Schema Normalization (3NF & BCNF Proofs)',
      subjectCode: 'CE-502',
      subjectName: 'Database Management Systems',
      facultyName: 'Prof. Rajesh Joshi',
      dueDate: 'Oct 15, 2025',
      status: 'GRADED',
      maxMarks: 20,
      obtainedMarks: 19,
      description: 'Functional dependencies and lossless decomposition exercise problems.',
    },
  ];

  const filteredAssignments = assignments.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'SUBMITTED') return item.status === 'SUBMITTED' || item.status === 'GRADED';
    return true;
  });

  const handleSubmit = (asg: AssignmentItem) => {
    Alert.alert(
      'Upload Assignment Solution',
      `Submit coursework solution for "${asg.title}" (${asg.subjectCode})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload PDF / ZIP',
          onPress: () => {
            Alert.alert('Success', 'Assignment submitted successfully to the faculty evaluation portal.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Academic Assignments</Text>
        <Text style={styles.topSubtitle}>Continuous Internal Evaluation (CIE)</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'PENDING', 'SUBMITTED'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterBtn, filter === tab && styles.filterBtnActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterBtnText, filter === tab && styles.filterBtnTextActive]}>
              {tab === 'ALL' ? 'All Tasks' : tab === 'PENDING' ? 'Pending (1)' : 'Submitted (2)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 600);
            }}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {filteredAssignments.map((asg) => (
          <View key={asg.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeGroup}>
                <Badge label={asg.subjectCode} variant="primary" size="sm" />
                <Badge
                  label={asg.status}
                  variant={asg.status === 'PENDING' ? 'warning' : asg.status === 'GRADED' ? 'success' : 'info'}
                  size="sm"
                />
              </View>
              <Text style={styles.marksText}>
                {asg.obtainedMarks !== undefined ? `${asg.obtainedMarks} / ${asg.maxMarks} Marks` : `Max: ${asg.maxMarks} Marks`}
              </Text>
            </View>

            <Text style={styles.asgTitle}>{asg.title}</Text>
            <Text style={styles.subjectName}>{asg.subjectName} • {asg.facultyName}</Text>
            <Text style={styles.description}>{asg.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={14} color={asg.status === 'PENDING' ? THEME.colors.danger : THEME.colors.textMuted} />
                <Text
                  style={[
                    styles.metaText,
                    asg.status === 'PENDING' && { color: THEME.colors.danger, fontWeight: '600' },
                  ]}
                >
                  Due: {asg.dueDate}
                </Text>
              </View>
            </View>

            {asg.status === 'PENDING' ? (
              <Button
                title="Upload Solution"
                onPress={() => handleSubmit(asg)}
                icon={<UploadCloud size={16} color="#FFFFFF" />}
                style={{ marginTop: 12 }}
              />
            ) : (
              <View style={styles.submittedBox}>
                <CheckCircle2 size={16} color={THEME.colors.success} />
                <Text style={styles.submittedText}>
                  {asg.status === 'GRADED' ? 'Graded by Faculty' : 'Submitted for Evaluation'}
                </Text>
              </View>
            )}
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
  },
  topTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  topSubtitle: {
    fontSize: 11,
    color: THEME.colors.accentLight,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: '#F1F5F9',
  },
  filterBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  marksText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  asgTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  subjectName: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  submittedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginTop: 12,
    gap: 8,
  },
  submittedText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.success,
  },
});
