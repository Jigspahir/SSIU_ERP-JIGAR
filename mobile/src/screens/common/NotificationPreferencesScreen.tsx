import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  Award,
  Clock,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  CreditCard,
  Volume2,
  Save,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';

interface CategoryPreference {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
}

export const NotificationPreferencesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [preferences, setPreferences] = useState<CategoryPreference[]>([
    {
      id: 'ATTENDANCE_ALERT',
      title: 'Attendance Alerts & Defaulter Warnings',
      description: 'Instant notification when attendance falls below 75% or lecture absent is marked.',
      icon: <CalendarCheck size={18} color="#059669" />,
      enabled: true,
    },
    {
      id: 'ACADEMIC_ALERT',
      title: 'Academic Alerts & Remedial Notices',
      description: 'Continuous internal CIE marks, assignments deadlines, and faculty remarks.',
      icon: <Award size={18} color="#2563EB" />,
      enabled: true,
    },
    {
      id: 'EXAM_RESULT',
      title: 'Examination Results & Grade Sheets',
      description: 'Official university end-term results and provisional SGPA / CGPA updates.',
      icon: <Award size={18} color="#7C3AED" />,
      enabled: true,
    },
    {
      id: 'EXAM_REMINDER',
      title: 'Exam Schedule & Hall Ticket Reminders',
      description: 'Seating arrangements, exam time tables, and invigilation duties.',
      icon: <Clock size={18} color="#0891B2" />,
      enabled: true,
    },
    {
      id: 'PTM_REMINDER',
      title: 'PTM Consultation Reminders',
      description: 'Parent-Teacher Meeting slots, room confirmations, and Google Meet video links.',
      icon: <Clock size={18} color="#D97706" />,
      enabled: true,
    },
    {
      id: 'PTM_SCHEDULE',
      title: 'PTM Schedule & Slot Dispatches',
      description: 'Invitations and reschedule approvals for mentor counseling consultations.',
      icon: <CalendarCheck size={18} color="#D97706" />,
      enabled: true,
    },
    {
      id: 'UNIVERSITY_NOTICE',
      title: 'University Notices & Circulars',
      description: 'Official announcements from Provost, Registrar, and Student Section.',
      icon: <Bell size={18} color="#475569" />,
      enabled: true,
    },
    {
      id: 'REQUEST_UPDATE',
      title: 'Service Request Updates',
      description: 'Status updates for Bonafide, Elective, and Leave approvals.',
      icon: <HelpCircle size={18} color="#2563EB" />,
      enabled: true,
    },
    {
      id: 'COMPLAINT_UPDATE',
      title: 'Grievance & Complaint Resolutions',
      description: 'Confidential investigation updates from the University Grievance Cell.',
      icon: <AlertTriangle size={18} color="#DC2626" />,
      enabled: true,
    },
    {
      id: 'IMPORTANT_ANNOUNCEMENT',
      title: 'Campus Emergency & Urgent Alerts',
      description: 'Weather advisories, holiday declarations, and emergency alerts.',
      icon: <AlertTriangle size={18} color="#B91C1C" />,
      enabled: true,
    },
    {
      id: 'FEE_REMINDER',
      title: 'Fee Dues & Payment Receipts',
      description: 'Semester tuition fee installment alerts and online payment receipts.',
      icon: <CreditCard size={18} color="#059669" />,
      enabled: true,
    },
    {
      id: 'DOCUMENT_UPDATE',
      title: 'Document Verification Stamps',
      description: 'Alerts when uploaded certificates, affidavits, or ID cards are verified.',
      icon: <FileCheck size={18} color="#0284C7" />,
      enabled: true,
    },
  ]);

  const togglePref = (id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = () => {
    Alert.alert('Preferences Saved', 'Your notification categories have been updated on the Swarrnim push gateway.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notification Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Customize Alert Channels</Text>
        <Text style={styles.sectionSub}>Choose which university categories trigger push alerts on this device.</Text>

        {preferences.map((item) => (
          <View key={item.id} style={styles.prefCard}>
            <View style={styles.iconBox}>{item.icon}</View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={styles.prefTitle}>{item.title}</Text>
              <Text style={styles.prefDesc}>{item.description}</Text>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => togglePref(item.id)}
              trackColor={{ false: '#CBD5E1', true: THEME.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}

        <Button
          title="Save Alert Preferences"
          onPress={handleSave}
          icon={<Save size={16} color="#FFFFFF" />}
          style={{ marginTop: 14, marginBottom: 30 }}
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
  sectionHeader: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  sectionSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
    marginTop: 2,
  },
  prefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
    ...THEME.shadows.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefTitle: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  prefDesc: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
});
