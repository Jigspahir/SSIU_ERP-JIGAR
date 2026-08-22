import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Users, ArrowLeft, Calendar, Clock, Edit3, CheckCircle2, MessageSquare, X, Save, CheckSquare, XCircle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const FacultyPTMScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [schedules, setSchedules] = useState([
    {
      id: 'ptm-1',
      studentName: 'Aarav Sharma',
      parentName: 'Rajesh Sharma (+91 98765 43210)',
      date: '2025-03-25',
      timeSlot: '10:30 AM - 11:00 AM',
      status: 'CONFIRMED',
      parentAttended: true,
      isCompleted: false,
      remarks: 'Good progress in Algorithms. Discuss elective choices.',
    },
    {
      id: 'ptm-2',
      studentName: 'Rohan Verma',
      parentName: 'Suresh Verma (+91 98765 88888)',
      date: '2025-03-25',
      timeSlot: '11:00 AM - 11:30 AM',
      status: 'RESCHEDULE_REQUESTED',
      parentAttended: false,
      isCompleted: false,
      remarks: 'Low attendance in TOC (<70%). Need parent intervention.',
    },
    {
      id: 'ptm-3',
      studentName: 'Diya Patel',
      parentName: 'Manish Patel (+91 98765 99999)',
      date: '2025-03-25',
      timeSlot: '11:30 AM - 12:00 PM',
      status: 'INVITED',
      parentAttended: false,
      isCompleted: false,
      remarks: 'Routine progress evaluation.',
    },
  ]);

  const [activePtm, setActivePtm] = useState<any | null>(null);
  const [editRemarksModal, setEditRemarksModal] = useState(false);
  const [remarksText, setRemarksText] = useState('');

  const openRemarksModal = (ptm: any) => {
    setActivePtm(ptm);
    setRemarksText(ptm.remarks);
    setEditRemarksModal(true);
  };

  const saveRemarks = () => {
    if (!activePtm) return;
    setSchedules((prev) =>
      prev.map((s) => (s.id === activePtm.id ? { ...s, remarks: remarksText } : s))
    );
    setEditRemarksModal(false);
    Alert.alert('Remarks Saved', 'PTM consultation remarks updated successfully.');
  };

  const toggleParentAttendance = (id: string, current: boolean) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, parentAttended: !current } : s))
    );
    Alert.alert(
      'Attendance Updated',
      `Parent attendance marked as ${!current ? 'PRESENT / ATTENDED' : 'ABSENT'}.`
    );
  };

  const completePtm = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isCompleted: true, status: 'COMPLETED' } : s))
    );
    Alert.alert('PTM Completed', 'Consultation session finalized and locked into student dossier.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Faculty PTM Consultation Desk</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Upcoming Scheduled Consultations</Text>

        {schedules.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.parentName}>{item.parentName}</Text>
              </View>
              <Badge
                label={item.isCompleted ? 'COMPLETED' : item.status.replace('_', ' ')}
                variant={
                  item.isCompleted
                    ? 'success'
                    : item.status === 'CONFIRMED'
                    ? 'success'
                    : item.status === 'RESCHEDULE_REQUESTED'
                    ? 'warning'
                    : 'primary'
                }
                size="sm"
              />
            </View>

            <View style={styles.timeBox}>
              <Calendar size={13} color={THEME.colors.primary} />
              <Text style={styles.timeText}>{item.date} • {item.timeSlot}</Text>
            </View>

            <View style={styles.remarksBox}>
              <Text style={styles.remarksTitle}>Current Remarks:</Text>
              <Text style={styles.remarksContent}>"{item.remarks}"</Text>
            </View>

            {/* Attendance & Action Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.attendanceToggleBtn,
                  item.parentAttended && { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
                ]}
                onPress={() => toggleParentAttendance(item.id, item.parentAttended)}
              >
                <CheckCircle2
                  size={14}
                  color={item.parentAttended ? THEME.colors.success : THEME.colors.textMuted}
                />
                <Text
                  style={[
                    styles.attendanceToggleText,
                    item.parentAttended && { color: THEME.colors.success, fontWeight: '700' },
                  ]}
                >
                  {item.parentAttended ? 'Parent Present' : 'Mark Parent Present'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addRemarksBtn}
                onPress={() => openRemarksModal(item)}
              >
                <Edit3 size={14} color={THEME.colors.primary} />
                <Text style={styles.addRemarksBtnText}>Edit Remarks</Text>
              </TouchableOpacity>
            </View>

            {!item.isCompleted && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => completePtm(item.id)}
              >
                <CheckSquare size={14} color="#FFFFFF" />
                <Text style={styles.completeBtnText}>Finalize & Complete PTM Record</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Edit Remarks Modal */}
      <Modal visible={editRemarksModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Consultation Remarks</Text>
              <TouchableOpacity onPress={() => setEditRemarksModal(false)}>
                <X size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalStudent}>Student: {activePtm?.studentName}</Text>

            <Input
              label="Observation & Action Plan"
              value={remarksText}
              onChangeText={setRemarksText}
              multiline
              numberOfLines={4}
              style={{ height: 90 }}
            />

            <Button
              title="Save Consultation Record"
              onPress={saveRemarks}
              icon={<Save size={16} color="#FFFFFF" />}
              style={{ marginTop: 10 }}
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
  sectionHeader: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studentName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  parentName: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.semibold,
  },
  remarksBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
  },
  remarksTitle: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  remarksContent: {
    fontSize: 12,
    color: THEME.colors.text,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  attendanceToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  attendanceToggleText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
  },
  addRemarksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  addRemarksBtnText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.success,
    paddingVertical: 9,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  modalStudent: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.semibold,
    marginBottom: 12,
  },
});
