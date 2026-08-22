import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ArrowLeft, Check, X, Users, Save, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';

interface StudentAttendanceItem {
  id: string;
  name: string;
  enrollmentNo: string;
  present: boolean;
}

export const FacultyAttendanceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [students, setStudents] = useState<StudentAttendanceItem[]>([
    { id: '1', name: 'Aarav Sharma', enrollmentNo: '24010101001', present: true },
    { id: '2', name: 'Diya Patel', enrollmentNo: '24010101002', present: true },
    { id: '3', name: 'Kabir Verma', enrollmentNo: '24010101003', present: false },
    { id: '4', name: 'Meera Joshi', enrollmentNo: '24010101004', present: true },
    { id: '5', name: 'Rohan Shah', enrollmentNo: '24010101005', present: true },
    { id: '6', name: 'Ananya Mehta', enrollmentNo: '24010101006', present: false },
    { id: '7', name: 'Devansh Trivedi', enrollmentNo: '24010101007', present: true },
  ]);

  const [saving, setSaving] = useState(false);

  const toggleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: !s.present } : s))
    );
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, present: true })));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Attendance Saved', 'Lecture attendance for CE-501 (Div A) has been recorded successfully and synced to the ERP database.');
      navigation.goBack();
    }, 600);
  };

  const presentCount = students.filter((s) => s.present).length;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Mark Daily Attendance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Lecture Meta */}
        <View style={styles.lectureMetaBox}>
          <Text style={styles.metaCourse}>CE-501 • Design & Analysis of Algorithms</Text>
          <Text style={styles.metaDetails}>B.Tech Computer Engineering • Semester 5 • Division A</Text>
          <Text style={styles.metaDate}>Date: Today, {new Date().toLocaleDateString('en-GB')}</Text>

          <View style={styles.counterRow}>
            <Text style={styles.counterText}>
              Present: <Text style={{ color: THEME.colors.success, fontWeight: '700' }}>{presentCount}</Text> / {students.length}
            </Text>
            <TouchableOpacity onPress={markAllPresent} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark All Present</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Student Roster */}
        {students.map((student) => (
          <TouchableOpacity
            key={student.id}
            activeOpacity={0.8}
            onPress={() => toggleStatus(student.id)}
            style={[styles.studentCard, student.present ? styles.presentCard : styles.absentCard]}
          >
            <View style={styles.info}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.rollNo}>{student.enrollmentNo}</Text>
            </View>

            <View style={[styles.statusToggle, student.present ? styles.presentToggle : styles.absentToggle]}>
              {student.present ? (
                <>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.toggleText}>Present</Text>
                </>
              ) : (
                <>
                  <X size={16} color="#FFFFFF" />
                  <Text style={styles.toggleText}>Absent</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <Button
          title="Submit & Lock Attendance"
          onPress={handleSave}
          loading={saving}
          icon={<Save size={16} color="#FFFFFF" />}
          style={{ marginTop: 14 }}
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
  lectureMetaBox: {
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  metaCourse: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  metaDetails: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  metaDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  counterText: {
    fontSize: 12,
    color: THEME.colors.text,
  },
  markAllBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  presentCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  absentCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  info: {
    flex: 1,
  },
  studentName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  rollNo: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
  },
  presentToggle: {
    backgroundColor: THEME.colors.success,
  },
  absentToggle: {
    backgroundColor: THEME.colors.danger,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
  },
});
