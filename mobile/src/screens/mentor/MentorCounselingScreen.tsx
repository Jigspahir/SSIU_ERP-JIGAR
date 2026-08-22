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
import { MessageSquare, Plus, Calendar, Clock, User, CheckCircle2, Phone, X, Send, AlertTriangle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

interface CounselingEntry {
  id: string;
  studentName: string;
  enrollmentNo: string;
  date: string;
  topic: string;
  category: 'ATTENDANCE' | 'ACADEMIC' | 'CAREER' | 'PERSONAL';
  notes: string;
  actionPlan: string;
  followUpDate: string;
}

export const MentorCounselingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentName, setStudentName] = useState('Rohan Verma (24010101042)');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [actionPlan, setActionPlan] = useState('');

  const [entries, setEntries] = useState<CounselingEntry[]>([
    {
      id: 'c-1',
      studentName: 'Rohan Verma',
      enrollmentNo: '24010101042',
      date: '20 Feb 2025',
      topic: 'Low Attendance (<70%) & Mathematics Remedial Support',
      category: 'ATTENDANCE',
      notes: 'Discussed health-related absenteeism during January. Student committed to attending all morning tutorial sessions.',
      actionPlan: 'Weekly attendance review with mentor. Extra practice problems assigned for Calculus & Graph Theory.',
      followUpDate: '05 Mar 2025',
    },
    {
      id: 'c-2',
      studentName: 'Diya Patel',
      enrollmentNo: '24010101018',
      date: '12 Feb 2025',
      topic: 'Career Roadmap & Innovation Project Mentorship',
      category: 'CAREER',
      notes: 'Reviewed student idea for Swarrnim Hackathon on Smart Healthcare IoT. Encouraged submission to Incubation Cell.',
      actionPlan: 'Connect with Incubation Centre coordinator for seed grant proposal drafting.',
      followUpDate: '10 Mar 2025',
    },
  ]);

  const handleSave = () => {
    if (!topic.trim() || !notes.trim()) {
      Alert.alert('Required', 'Please enter discussion topic and counseling observation notes.');
      return;
    }

    const newEntry: CounselingEntry = {
      id: `c-${Date.now()}`,
      studentName: 'Rohan Verma',
      enrollmentNo: '24010101042',
      date: 'Today',
      topic,
      category: 'ACADEMIC',
      notes,
      actionPlan: actionPlan || 'Continuous monitoring.',
      followUpDate: 'In 2 Weeks',
    };

    setEntries([newEntry, ...entries]);
    setModalVisible(false);
    setTopic('');
    setNotes('');
    setActionPlan('');
    Alert.alert('Saved', 'Counseling log has been added to official student diary records.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Student Mentorship & Counseling</Text>
        <Text style={styles.topSubtitle}>Confidential Guidance Logs</Text>
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
          title="Log New Counseling Session"
          onPress={() => setModalVisible(true)}
          icon={<Plus size={16} color="#FFFFFF" />}
          style={{ marginBottom: 16 }}
        />

        {entries.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.enrollment}>{item.enrollmentNo}</Text>
              </View>
              <Badge
                label={item.category}
                variant={item.category === 'ATTENDANCE' ? 'danger' : item.category === 'CAREER' ? 'success' : 'primary'}
                size="sm"
              />
            </View>

            <Text style={styles.topicText}>{item.topic}</Text>

            <View style={styles.notesBox}>
              <Text style={styles.boxLabel}>Counselor Observation:</Text>
              <Text style={styles.boxText}>{item.notes}</Text>
            </View>

            <View style={[styles.notesBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={[styles.boxLabel, { color: '#1E40AF' }]}>Action Plan & Follow-up:</Text>
              <Text style={[styles.boxText, { color: '#1E3A8A' }]}>{item.actionPlan}</Text>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.footerItem}>
                <Calendar size={13} color={THEME.colors.textMuted} />
                <Text style={styles.footerText}>Logged: {item.date}</Text>
              </View>

              <View style={styles.footerItem}>
                <Clock size={13} color={THEME.colors.accentDark} />
                <Text style={[styles.footerText, { color: THEME.colors.accentDark, fontWeight: '600' }]}>
                  Next Review: {item.followUpDate}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* New Counseling Session Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Mentee Counseling Log</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Select Mentee</Text>
            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyText}>{studentName}</Text>
            </View>

            <Text style={styles.inputLabel}>Discussion Agenda / Reason</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mid-Term Backlog Remedial Planning"
              value={topic}
              onChangeText={setTopic}
            />

            <Text style={styles.inputLabel}>Counseling Observations & Discussion Notes</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Summary of student challenges, feedback and commitments..."
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <Text style={styles.inputLabel}>Agreed Action Plan</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Weekly progress check-in every Monday"
              value={actionPlan}
              onChangeText={setActionPlan}
            />

            <Button
              title="Save Counseling Entry"
              onPress={handleSave}
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
  studentName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  enrollment: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    fontWeight: THEME.typography.weights.semibold,
  },
  topicText: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.text,
    marginBottom: 10,
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 8,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  boxText: {
    fontSize: 12,
    color: THEME.colors.text,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
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
    marginBottom: 4,
    marginTop: 8,
  },
  readOnlyBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
  },
  readOnlyText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
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
