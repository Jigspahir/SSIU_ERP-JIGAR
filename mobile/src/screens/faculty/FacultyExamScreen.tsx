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
import { Award, Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, FileEdit } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';

export const FacultyExamScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Examination & Marks Entry</Text>
        <Text style={styles.topSubtitle}>Faculty Assessment Desk</Text>
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
        {/* Continuous Internal Evaluation Marks Entry */}
        <Text style={styles.sectionHeader}>Internal Evaluation & CIE Ledgers</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.subjectCode}>CE-501 • Division A</Text>
            <Badge label="Due: 30 Oct" variant="warning" size="sm" />
          </View>
          <Text style={styles.subjectTitle}>Design & Analysis of Algorithms</Text>
          <Text style={styles.metaText}>Continuous Internal Evaluation (Max: 50 Marks)</Text>

          <View style={styles.progressBox}>
            <Text style={styles.progressLabel}>Marks Entry Status</Text>
            <Text style={styles.progressVal}>48 / 60 Students Entered (80%)</Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Marks Entry', 'Opening continuous internal marks sheet for CE-501 Division A...')}
          >
            <FileEdit size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Enter / Edit CIE Marks</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.subjectCode}>CE-501-P (Lab) • Batch A1</Text>
            <Badge label="Completed" variant="success" size="sm" />
          </View>
          <Text style={styles.subjectTitle}>Algorithms Laboratory (Practical)</Text>
          <Text style={styles.metaText}>Mid-Semester Practical Exam (Max: 30 Marks)</Text>

          <View style={styles.progressBox}>
            <Text style={styles.progressLabel}>Marks Entry Status</Text>
            <Text style={styles.progressVal}>30 / 30 Students Submitted (100%)</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#F1F5F9' }]}
            onPress={() => Alert.alert('Review Sheet', 'Viewing verified practical marks for CE-501-P...')}
          >
            <CheckCircle2 size={16} color={THEME.colors.success} />
            <Text style={[styles.actionBtnText, { color: THEME.colors.text }]}>View Submitted Sheet</Text>
          </TouchableOpacity>
        </View>

        {/* Assigned Invigilation & Exam Duties */}
        <Text style={styles.sectionHeader}>Assigned Examination Duties</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.dutyTitle}>Senior Supervisor / Invigilator</Text>
            <Badge label="Upcoming" variant="primary" size="sm" />
          </View>
          <Text style={styles.dutySub}>Winter 2025 Mid-Semester Examination</Text>

          <View style={styles.infoRow}>
            <Calendar size={15} color={THEME.colors.primary} />
            <Text style={styles.infoText}>Monday, 10 Nov 2025</Text>
            <View style={{ width: 12 }} />
            <Clock size={15} color={THEME.colors.primary} />
            <Text style={styles.infoText}>10:00 AM - 01:00 PM</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={15} color={THEME.colors.primary} />
            <Text style={styles.infoText}>Exam Hall 4, Technology Block B (Room 401)</Text>
          </View>
        </View>
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
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    marginTop: 10,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subjectCode: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  subjectTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  progressBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginVertical: 10,
  },
  progressLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  progressVal: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
  },
  dutyTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  dutySub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 11,
    color: THEME.colors.text,
    marginLeft: 6,
  },
});
