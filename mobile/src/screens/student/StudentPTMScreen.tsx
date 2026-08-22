import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle, Phone, MessageSquare } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { DataService } from '../../services/dataService';
import { PTMRecord } from '../../types';

export const StudentPTMScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [schedules, setSchedules] = useState<PTMRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await DataService.getPTMRecords('STUDENT');
    setSchedules(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Parent–Teacher Meetings (PTM)</Text>
        <Text style={styles.topSubtitle}>Faculty & Mentor Consultations</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Information Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.bannerHeading}>Consultation Policy</Text>
          <Text style={styles.bannerText}>
            PTM consultations are arranged to review your semester academic progression, attendance trends, and continuous internal evaluations with your parents and assigned mentor.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>Scheduled Meetings</Text>

        {schedules.map((ptm) => (
          <View key={ptm.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.meetingTitle}>{ptm.title}</Text>
              <Badge
                label={ptm.status}
                variant={ptm.status === 'CONFIRMED' || ptm.status === 'COMPLETED' ? 'success' : 'info'}
                size="sm"
              />
            </View>

            <View style={styles.detailRow}>
              <Calendar size={15} color={THEME.colors.primary} />
              <Text style={styles.detailText}>{ptm.date}</Text>
              <View style={{ width: 12 }} />
              <Clock size={15} color={THEME.colors.primary} />
              <Text style={styles.detailText}>{ptm.timeSlot}</Text>
            </View>

            <View style={styles.detailRow}>
              <User size={15} color={THEME.colors.primary} />
              <Text style={styles.detailText}>{ptm.facultyName}</Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={15} color={THEME.colors.primary} />
              <Text style={styles.detailText}>{ptm.venue || ptm.mode}</Text>
            </View>

            {ptm.facultyRemarks && (
              <View style={styles.remarksBox}>
                <MessageSquare size={14} color={THEME.colors.textSecondary} />
                <Text style={styles.remarksText}>{ptm.facultyRemarks}</Text>
              </View>
            )}

            <View style={styles.statusFooter}>
              <CheckCircle2 size={14} color={THEME.colors.success} />
              <Text style={styles.statusFooterText}>
                {ptm.status === 'COMPLETED' ? 'Consultation Completed' : 'Scheduled Consultation'}
              </Text>
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
  infoBanner: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: THEME.spacing.md,
  },
  bannerHeading: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: '#1E40AF',
  },
  bannerText: {
    fontSize: 11,
    color: '#1E3A8A',
    lineHeight: 16,
    marginTop: 4,
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
  meetingTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    flex: 1,
    marginRight: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: THEME.colors.text,
    marginLeft: 6,
  },
  remarksBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginTop: 6,
    gap: 8,
  },
  remarksText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  statusFooterText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.success,
  },
});
