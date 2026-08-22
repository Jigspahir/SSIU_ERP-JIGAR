import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Plus, ArrowLeft, Clock, CheckCircle2, MessageSquare, ChevronRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { StudentServiceRequest } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const StudentRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [requests, setRequests] = useState<StudentServiceRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await DataService.getRequests();
    setRequests(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusBadge = (status: StudentServiceRequest['status']) => {
    switch (status) {
      case 'RESOLVED':
        return { label: 'Resolved', variant: 'success' as const };
      case 'IN_PROGRESS':
        return { label: 'In Progress', variant: 'info' as const };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', variant: 'warning' as const };
      case 'CLOSED':
        return { label: 'Closed', variant: 'neutral' as const };
      default:
        return { label: 'Submitted', variant: 'primary' as const };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Student Service Requests</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Actions Row */}
        <View style={styles.buttonRow}>
          <Button
            title="Create New Request"
            onPress={() => navigation.navigate('CreateRequest')}
            icon={<Plus size={16} color="#FFFFFF" />}
            style={{ flex: 1 }}
          />
          <View style={{ width: 10 }} />
          <Button
            title="Lodge Grievance"
            onPress={() => navigation.navigate('CreateComplaint')}
            variant="outline"
            style={{ flex: 1 }}
          />
        </View>

        <Text style={styles.sectionTitle}>Active & Previous Requests</Text>

        {requests.map((req) => {
          const badge = getStatusBadge(req.status);
          return (
            <TouchableOpacity
              key={req.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RequestDetail', { request: req })}
              style={styles.reqCard}
            >
              <View style={styles.reqHeader}>
                <View>
                  <Text style={styles.ticketNo}>{req.ticketNumber}</Text>
                  <Text style={styles.category}>{req.category}</Text>
                </View>
                <Badge label={badge.label} variant={badge.variant} size="sm" />
              </View>

              <Text style={styles.reqTitle}>{req.title}</Text>
              <Text style={styles.reqDesc} numberOfLines={2}>
                {req.description}
              </Text>

              {req.responseRemarks && (
                <View style={styles.responseBox}>
                  <Text style={styles.responseLabel}>Official Response ({req.assignedOffice}):</Text>
                  <Text style={styles.responseText} numberOfLines={2}>
                    {req.responseRemarks}
                  </Text>
                </View>
              )}

              <View style={styles.reqFooter}>
                <Clock size={11} color={THEME.colors.textMuted} />
                <Text style={styles.footerDate}>Submitted: {req.createdAt}</Text>
                <ChevronRight size={14} color={THEME.colors.textMuted} style={{ marginLeft: 'auto' }} />
              </View>
            </TouchableOpacity>
          );
        })}
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
  buttonRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  reqCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
    ...THEME.shadows.sm,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  ticketNo: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  category: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.medium,
    marginTop: 1,
  },
  reqTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  reqDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  responseBox: {
    backgroundColor: '#F0F7FF',
    padding: 8,
    borderRadius: THEME.borderRadius.md,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  responseLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  responseText: {
    fontSize: 11,
    color: THEME.colors.text,
    marginTop: 2,
  },
  reqFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  footerDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
});
