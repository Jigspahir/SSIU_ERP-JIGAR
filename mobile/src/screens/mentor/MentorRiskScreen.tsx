import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { AlertTriangle, ArrowLeft, PhoneCall, Calendar, ShieldAlert, Sparkles, Send } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const MentorRiskScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [riskStudents, setRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    DataService.getMentorMentees().then((res) => {
      setRiskStudents(res.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM'));
    });
  }, []);

  const triggerPTMInvite = (studentName: string) => {
    Alert.alert('Initiate PTM Consultation', `Schedule an urgent Parent-Teacher consultation for ${studentName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send Invite', onPress: () => Alert.alert('Invitation Dispatched', 'PTM notification and SMS sent to the registered guardian.') },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Academic & Attendance Risk Radar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBanner}>
          <ShieldAlert size={20} color="#991B1B" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoTitle}>Early Warning & Intervention System</Text>
            <Text style={styles.infoSubtitle}>
              Identifies mentees with attendance below 75% or remedial examination backlogs requiring faculty counseling.
            </Text>
          </View>
        </View>

        {riskStudents.map((student) => (
          <View key={student.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.name}>{student.name}</Text>
                <Text style={styles.meta}>{student.enrollmentNo} • {student.program}</Text>
              </View>
              <Badge
                label={student.riskLevel === 'HIGH' ? 'Critical Defaulter' : 'Borderline'}
                variant={student.riskLevel === 'HIGH' ? 'danger' : 'warning'}
                size="sm"
              />
            </View>

            <View style={styles.statsBlock}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Current Attendance</Text>
                <Text style={[styles.statVal, { color: THEME.colors.danger }]}>
                  {student.attendancePercentage}%
                </Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>CGPA Status</Text>
                <Text style={[styles.statVal, { color: THEME.colors.primary }]}>
                  {student.cgpa.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.reasonsList}>
              <Text style={styles.reasonsTitle}>Identified Risk Factors:</Text>
              {student.riskFlags.map((flag: string, i: number) => (
                <Text key={i} style={styles.reasonText}>• {flag}</Text>
              ))}
            </View>

            <View style={styles.btnRow}>
              <Button
                title="Schedule PTM"
                onPress={() => triggerPTMInvite(student.name)}
                icon={<Calendar size={14} color="#FFFFFF" />}
                style={{ flex: 1 }}
              />
              <View style={{ width: 8 }} />
              <Button
                title="Call Parent"
                variant="outline"
                onPress={() => Linking.openURL(`tel:${student.guardianPhone.replace(/\s+/g, '')}`)}
                icon={<PhoneCall size={14} color={THEME.colors.primary} />}
                style={{ flex: 1 }}
              />
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  infoTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  infoSubtitle: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 15,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
    ...THEME.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  name: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  meta: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  statsBlock: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 10,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  statVal: {
    fontSize: 16,
    fontWeight: THEME.typography.weights.bold,
    marginTop: 2,
  },
  reasonsList: {
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: THEME.typography.weights.medium,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
  },
});
