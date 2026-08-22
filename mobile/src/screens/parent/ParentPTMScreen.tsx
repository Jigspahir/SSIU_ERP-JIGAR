import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {
  Users,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  X,
  Send,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { PTMRecord } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const ParentPTMScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, selectedChild } = useAuth();
  const [ptmRecords, setPtmRecords] = useState<PTMRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Reschedule Modal State
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedPtmId, setSelectedPtmId] = useState<string | null>(null);
  const [proposedDate, setProposedDate] = useState('2025-03-28');
  const [proposedTime, setProposedTime] = useState('02:00 PM');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!selectedChild) return;
    const data = await DataService.getPTMRecords('PARENT', selectedChild.id);
    setPtmRecords(data);
  };

  useEffect(() => {
    loadData();
  }, [selectedChild?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleConfirm = async (id: string) => {
    await DataService.confirmPTMAttendance(id);
    Alert.alert('Attendance Confirmed', 'Thank you! Your PTM consultation slot has been confirmed with the faculty coordinator.');
    setPtmRecords((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'CONFIRMED' } : item))
    );
  };

  const openRescheduleModal = (id: string) => {
    setSelectedPtmId(id);
    setRescheduleModalVisible(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedPtmId || !rescheduleReason.trim()) {
      Alert.alert('Missing Info', 'Please provide a reason for requesting a reschedule.');
      return;
    }
    setSubmitting(true);
    try {
      await DataService.requestPTMReschedule(selectedPtmId, proposedDate, proposedTime, rescheduleReason);
      setPtmRecords((prev) =>
        prev.map((item) =>
          item.id === selectedPtmId
            ? {
                ...item,
                status: 'RESCHEDULE_REQUESTED',
                rescheduleReason,
                proposedDate,
                proposedTime,
              }
            : item
        )
      );
      setRescheduleModalVisible(false);
      setRescheduleReason('');
      Alert.alert('Request Sent', 'Your reschedule request has been submitted to the department coordinator.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Parent–Teacher Consultation</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        <Text style={styles.sectionTitle}>
          Meetings for {selectedChild?.name || 'Selected Child'}
        </Text>

        {ptmRecords.map((ptm) => {
          const isPendingResponse = ptm.status === 'INVITED' || ptm.status === 'SCHEDULED';
          return (
            <View key={ptm.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ptmTitle}>{ptm.title}</Text>
                  <Text style={styles.facultyName}>{ptm.facultyName}</Text>
                </View>
                <Badge
                  label={ptm.status.replace('_', ' ')}
                  variant={
                    ptm.status === 'CONFIRMED'
                      ? 'success'
                      : ptm.status === 'RESCHEDULE_REQUESTED'
                      ? 'warning'
                      : ptm.status === 'COMPLETED'
                      ? 'neutral'
                      : 'primary'
                  }
                  size="sm"
                />
              </View>

              <View style={styles.detailsBlock}>
                <View style={styles.detailRow}>
                  <Calendar size={14} color={THEME.colors.primary} />
                  <Text style={styles.detailText}>Date: {ptm.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color={THEME.colors.primary} />
                  <Text style={styles.detailText}>Time: {ptm.timeSlot}</Text>
                </View>
                <View style={styles.detailRow}>
                  {ptm.mode === 'ONLINE' ? (
                    <Video size={14} color="#2563EB" />
                  ) : (
                    <MapPin size={14} color="#D97706" />
                  )}
                  <Text style={styles.detailText}>
                    {ptm.mode === 'ONLINE'
                      ? `Virtual: ${ptm.meetingLink}`
                      : `Venue: ${ptm.venue || 'Faculty Cabin'}`}
                  </Text>
                </View>
              </View>

              {ptm.facultyRemarks && (
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksLabel}>Faculty Agenda & Observations:</Text>
                  <Text style={styles.remarksText}>"{ptm.facultyRemarks}"</Text>
                </View>
              )}

              {ptm.actionItems && ptm.actionItems.length > 0 && (
                <View style={styles.actionsList}>
                  <Text style={styles.actionsLabel}>Action Items:</Text>
                  {ptm.actionItems.map((act, i) => (
                    <Text key={i} style={styles.actionItemText}>• {act}</Text>
                  ))}
                </View>
              )}

              {/* Action Buttons for Parent */}
              {isPendingResponse && (
                <View style={styles.buttonRow}>
                  <Button
                    title="Confirm Attendance"
                    onPress={() => handleConfirm(ptm.id)}
                    icon={<CheckCircle2 size={16} color="#FFFFFF" />}
                    style={{ flex: 1 }}
                  />
                  <View style={{ width: 8 }} />
                  <Button
                    title="Reschedule"
                    onPress={() => openRescheduleModal(ptm.id)}
                    variant="outline"
                    icon={<RotateCcw size={14} color={THEME.colors.primary} />}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={rescheduleModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request PTM Reschedule</Text>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                <X size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Please propose an alternative date/time and state the reason for the coordinator.
            </Text>

            <Input
              label="Proposed Alternative Date (YYYY-MM-DD)"
              value={proposedDate}
              onChangeText={setProposedDate}
            />

            <Input
              label="Preferred Time Slot"
              value={proposedTime}
              onChangeText={setProposedTime}
            />

            <Input
              label="Reason for Rescheduling"
              placeholder="e.g. Prior official engagement, out of town"
              value={rescheduleReason}
              onChangeText={setRescheduleReason}
              multiline
              numberOfLines={3}
              style={{ height: 70 }}
            />

            <Button
              title="Submit Reschedule Request"
              onPress={handleRescheduleSubmit}
              loading={submitting}
              icon={<Send size={16} color="#FFFFFF" />}
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
  sectionTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ptmTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  facultyName: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    fontWeight: THEME.typography.weights.semibold,
    marginTop: 2,
  },
  detailsBlock: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: THEME.colors.text,
  },
  remarksBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.accent,
    marginBottom: 10,
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: '#78350F',
  },
  remarksText: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionsList: {
    marginBottom: 10,
  },
  actionsLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  actionItemText: {
    fontSize: 11,
    color: THEME.colors.text,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 4,
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
  modalSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
  },
});
