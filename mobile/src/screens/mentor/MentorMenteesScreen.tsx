import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Users, ArrowLeft, Search, PhoneCall, Mail, BookOpen, AlertCircle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { Badge } from '../../components/common/Badge';

export const MentorMenteesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [mentees, setMentees] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    DataService.getMentorMentees().then(setMentees);
  }, []);

  const filteredMentees = mentees.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.enrollmentNo.includes(search)
  );

  const handleCallParent = (phone: string, studentName: string) => {
    Alert.alert('Call Guardian', `Place a direct phone call to the registered guardian of ${studentName}? (${phone})`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Assigned Mentees Roster</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={THEME.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by student name or enrollment number..."
          placeholderTextColor={THEME.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredMentees.map((mentee) => (
          <View key={mentee.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{mentee.name}</Text>
                <Text style={styles.rollNo}>{mentee.enrollmentNo} • {mentee.program} ({mentee.semester})</Text>
              </View>
              <Badge
                label={mentee.riskLevel === 'HIGH' ? 'Risk Alert' : mentee.riskLevel === 'MEDIUM' ? 'Borderline' : 'Good'}
                variant={mentee.riskLevel === 'HIGH' ? 'danger' : mentee.riskLevel === 'MEDIUM' ? 'warning' : 'success'}
                size="sm"
              />
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Attendance</Text>
                <Text
                  style={[
                    styles.metricVal,
                    { color: mentee.attendancePercentage >= 75 ? THEME.colors.success : THEME.colors.danger },
                  ]}
                >
                  {mentee.attendancePercentage}%
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>CGPA</Text>
                <Text style={[styles.metricVal, { color: THEME.colors.primary }]}>{mentee.cgpa.toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Guardian Phone</Text>
                <Text style={styles.metricPhone}>{mentee.guardianPhone}</Text>
              </View>
            </View>

            {mentee.riskFlags.length > 0 && (
              <View style={styles.riskFlagsBox}>
                {mentee.riskFlags.map((flag: string, i: number) => (
                  <View key={i} style={styles.flagRow}>
                    <AlertCircle size={12} color="#991B1B" />
                    <Text style={styles.flagText}>{flag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionPill}
                onPress={() => navigation.navigate('StudentDiary', { studentId: mentee.id })}
              >
                <BookOpen size={14} color={THEME.colors.primary} />
                <Text style={styles.actionPillText}>View Diary</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: '#ECFDF5' }]}
                onPress={() => handleCallParent(mentee.guardianPhone, mentee.name)}
              >
                <PhoneCall size={14} color="#059669" />
                <Text style={[styles.actionPillText, { color: '#059669' }]}>Call Guardian</Text>
              </TouchableOpacity>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    marginHorizontal: THEME.spacing.base,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: THEME.colors.text,
  },
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 12,
    ...THEME.shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  studentName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  rollNo: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 8,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.bold,
    marginTop: 1,
  },
  metricPhone: {
    fontSize: 11,
    color: THEME.colors.text,
    marginTop: 2,
    fontWeight: THEME.typography.weights.medium,
  },
  riskFlagsBox: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 8,
    gap: 4,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: THEME.typography.weights.semibold,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
});
