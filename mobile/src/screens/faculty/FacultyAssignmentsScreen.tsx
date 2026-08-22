import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { BookOpen, Plus, Clock, CheckCircle2, Users, FileText, X, Send } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

interface FacultyAssignment {
  id: string;
  title: string;
  subjectCode: string;
  division: string;
  totalSubmissions: number;
  totalStudents: number;
  dueDate: string;
  maxMarks: number;
  evaluated: number;
}

export const FacultyAssignmentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('CE-501 (Algorithms)');
  const [newMaxMarks, setNewMaxMarks] = useState('25');

  const [assignments, setAssignments] = useState<FacultyAssignment[]>([
    {
      id: 'asg-1',
      title: 'Distributed System Consensus Algorithms (Raft & Paxos)',
      subjectCode: 'CE-501',
      division: 'Division A',
      totalSubmissions: 54,
      totalStudents: 60,
      dueDate: 'Tomorrow, 11:59 PM',
      maxMarks: 25,
      evaluated: 38,
    },
    {
      id: 'asg-2',
      title: 'Dynamic Programming & Graph Flow Problems',
      subjectCode: 'CE-501',
      division: 'Division A',
      totalSubmissions: 58,
      totalStudents: 60,
      dueDate: 'Oct 15, 2025',
      maxMarks: 20,
      evaluated: 58,
    },
  ]);

  const handleCreateAssignment = () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter an assignment title.');
      return;
    }

    const created: FacultyAssignment = {
      id: `asg-${Date.now()}`,
      title: newTitle,
      subjectCode: 'CE-501',
      division: 'Division A',
      totalSubmissions: 0,
      totalStudents: 60,
      dueDate: 'Next Week',
      maxMarks: parseInt(newMaxMarks, 10) || 25,
      evaluated: 0,
    };

    setAssignments([created, ...assignments]);
    setModalVisible(false);
    setNewTitle('');
    Alert.alert('Published', 'Assignment published to student portals successfully.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Coursework & Assignments</Text>
        <Text style={styles.topSubtitle}>Continuous Internal Evaluation (CIE)</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 500);
            }}
            colors={[THEME.colors.primary]}
          />
        }
      >
        <Button
          title="Create New Assignment"
          onPress={() => setModalVisible(true)}
          icon={<Plus size={16} color="#FFFFFF" />}
          style={{ marginBottom: 16 }}
        />

        {assignments.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Badge label={`${item.subjectCode} • ${item.division}`} variant="primary" size="sm" />
              <Text style={styles.maxMarks}>Max: {item.maxMarks} Marks</Text>
            </View>

            <Text style={styles.asgTitle}>{item.title}</Text>

            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Users size={14} color={THEME.colors.textMuted} />
                <Text style={styles.progressText}>
                  Submissions: <Text style={{ fontWeight: '700' }}>{item.totalSubmissions}/{item.totalStudents}</Text>
                </Text>
              </View>

              <View style={styles.progressItem}>
                <CheckCircle2 size={14} color={THEME.colors.success} />
                <Text style={styles.progressText}>
                  Graded: <Text style={{ fontWeight: '700', color: THEME.colors.success }}>{item.evaluated}/{item.totalSubmissions}</Text>
                </Text>
              </View>
            </View>

            <View style={styles.metaFooter}>
              <View style={styles.dueBox}>
                <Clock size={13} color={THEME.colors.textSecondary} />
                <Text style={styles.dueText}>Due: {item.dueDate}</Text>
              </View>

              <TouchableOpacity
                style={styles.evaluateBtn}
                onPress={() => Alert.alert('Grading Portal', `Opening evaluation desk for ${item.title}...`)}
              >
                <Text style={styles.evaluateBtnText}>Evaluate Submissions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Assignment Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publish New Assignment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Assignment Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Shortest Path Algorithms in Graph Theory"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Maximum Marks</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              keyboardType="number-pad"
              value={newMaxMarks}
              onChangeText={setNewMaxMarks}
            />

            <Button
              title="Publish Coursework"
              onPress={handleCreateAssignment}
              icon={<Send size={16} color="#FFFFFF" />}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
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
  maxMarks: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  asgTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginVertical: 10,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  metaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  evaluateBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
  },
  evaluateBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    fontSize: 13,
    color: THEME.colors.text,
  },
});
