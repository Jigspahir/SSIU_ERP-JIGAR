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
import { ShieldCheck, FileText, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

interface PendingDocItem {
  id: string;
  studentName: string;
  enrollmentNo: string;
  docTitle: string;
  category: string;
  submissionDate: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
}

export const MentorDocVerificationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const [pendingDocs, setPendingDocs] = useState<PendingDocItem[]>([
    {
      id: 'doc-v-1',
      studentName: 'Rohan Verma',
      enrollmentNo: '24010101042',
      docTitle: 'Anti-Ragging Undertaking & Parent Affidavit',
      category: 'REGULATORY',
      submissionDate: 'Yesterday at 04:15 PM',
      status: 'PENDING_VERIFICATION',
    },
    {
      id: 'doc-v-2',
      studentName: 'Diya Patel',
      enrollmentNo: '24010101018',
      docTitle: 'Semester 4 Official Grade Card Transcript',
      category: 'ACADEMIC',
      submissionDate: '18 Feb 2025',
      status: 'PENDING_VERIFICATION',
    },
    {
      id: 'doc-v-3',
      studentName: 'Aarav Sharma',
      enrollmentNo: '24010101001',
      docTitle: 'DigiLocker ABC ID Verification Slip',
      category: 'IDENTITY',
      submissionDate: '10 Feb 2025',
      status: 'VERIFIED',
    },
  ]);

  const handleVerify = (id: string, name: string) => {
    setPendingDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'VERIFIED' } : d))
    );
    Alert.alert('Verified', `Document submitted by ${name} has been verified and stamped in student records.`);
  };

  const handleReject = (id: string, name: string) => {
    setPendingDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'REJECTED' } : d))
    );
    Alert.alert('Rejected', `Document rejected. Re-upload notice sent to ${name}.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Mentee Document Verification</Text>
        <Text style={styles.topSubtitle}>Regulatory & Academic Document Desk</Text>
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
        <Text style={styles.sectionHeader}>Pending Verification Queue</Text>

        {pendingDocs.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.enrollment}>{item.enrollmentNo}</Text>
              </View>
              <Badge
                label={item.status === 'PENDING_VERIFICATION' ? 'Pending' : item.status === 'VERIFIED' ? 'Verified' : 'Rejected'}
                variant={item.status === 'PENDING_VERIFICATION' ? 'warning' : item.status === 'VERIFIED' ? 'success' : 'danger'}
                size="sm"
              />
            </View>

            <View style={styles.docBox}>
              <FileText size={18} color={THEME.colors.primary} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.docTitle}>{item.docTitle}</Text>
                <Text style={styles.docCategory}>{item.category} • Submitted: {item.submissionDate}</Text>
              </View>
            </View>

            {item.status === 'PENDING_VERIFICATION' ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={() => handleVerify(item.id, item.studentName)}
                >
                  <CheckCircle2 size={14} color="#FFFFFF" />
                  <Text style={styles.verifyBtnText}>Verify & Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(item.id, item.studentName)}
                >
                  <XCircle size={14} color={THEME.colors.danger} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.statusFooter}>
                <CheckCircle2 size={14} color={THEME.colors.success} />
                <Text style={styles.statusFooterText}>
                  {item.status === 'VERIFIED' ? 'Verified by Faculty Mentor' : 'Rejected - Re-upload Requested'}
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  docBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 12,
  },
  docTitle: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  docCategory: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.success,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 4,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.dangerLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 4,
  },
  rejectBtnText: {
    color: THEME.colors.danger,
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  statusFooterText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.success,
  },
});
