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
import { ArrowLeft, CheckCircle2, XCircle, Clock, Send, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const FacultyRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      ticketNumber: 'SR-2025-142',
      studentName: 'Aarav Sharma (24010101001)',
      category: 'ACADEMIC',
      title: 'Elective Subject Change to AI/ML Track',
      description: 'Requesting permission to switch Semester 6 open elective to Deep Learning Applications.',
      status: 'UNDER_REVIEW',
      date: '18 Feb 2025',
    },
    {
      id: 'req-2',
      ticketNumber: 'SR-2025-155',
      studentName: 'Diya Patel (24010101018)',
      category: 'ATTENDANCE_LEAVE',
      title: 'Medical Leave Approval for 3 Days',
      description: 'Underwent dental surgery. Medical certificate attached in portal.',
      status: 'SUBMITTED',
      date: '19 Feb 2025',
    },
  ]);

  const [activeReq, setActiveReq] = useState<any | null>(null);
  const [respondModalVisible, setRespondModalVisible] = useState(false);
  const [remarks, setRemarks] = useState('');

  const openRespond = (req: any) => {
    setActiveReq(req);
    setRemarks('');
    setRespondModalVisible(true);
  };

  const handleAction = (status: 'RESOLVED' | 'UNDER_REVIEW') => {
    if (!activeReq) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === activeReq.id ? { ...r, status } : r))
    );
    setRespondModalVisible(false);
    Alert.alert('Response Recorded', `Request ${activeReq.ticketNumber} marked as ${status}.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Student Service Tickets</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Assigned Student Inquiries</Text>

        {requests.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.ticketNo}>{item.ticketNumber}</Text>
                <Text style={styles.studentName}>{item.studentName}</Text>
              </View>
              <Badge label={item.status.replace('_', ' ')} variant="warning" size="sm" />
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>

            <View style={styles.footerRow}>
              <Text style={styles.dateText}>Received: {item.date}</Text>
              <Button
                title="Review & Respond"
                size="sm"
                onPress={() => openRespond(item)}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Respond Modal */}
      <Modal visible={respondModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Respond to Request</Text>
              <TouchableOpacity onPress={() => setRespondModalVisible(false)}>
                <X size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalReqTitle}>{activeReq?.title}</Text>

            <Input
              label="Official Feedback / Remarks"
              placeholder="Enter remarks for the student..."
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              style={{ height: 75 }}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Approve & Resolve"
                onPress={() => handleAction('RESOLVED')}
                style={{ flex: 1 }}
              />
              <View style={{ width: 8 }} />
              <Button
                title="Forward Review"
                variant="outline"
                onPress={() => handleAction('UNDER_REVIEW')}
                style={{ flex: 1 }}
              />
            </View>
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
  sectionTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
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
    marginBottom: 6,
  },
  ticketNo: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
  },
  studentName: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  title: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginTop: 4,
  },
  desc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  modalReqTitle: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
