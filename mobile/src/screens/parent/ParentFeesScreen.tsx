import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CreditCard, ArrowLeft, Download, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { FeeSummary } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const ParentFeesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { selectedChild } = useAuth();
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!selectedChild) return;
    const data = await DataService.getFeeSummary(selectedChild.id);
    setFeeSummary(data);
  };

  useEffect(() => {
    loadData();
  }, [selectedChild?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDownloadReceipt = (invoiceNo: string) => {
    Alert.alert('Download Receipt', `Downloading official payment receipt for invoice ${invoiceNo}...`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Fees & Financial Ledger</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Annual Tuition & Exam Fees</Text>
          <Text style={styles.balanceAmount}>₹{feeSummary?.totalAnnualFee.toLocaleString() || '95,000'}</Text>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryColLabel}>Paid Amount</Text>
              <Text style={[styles.summaryColVal, { color: THEME.colors.success }]}>
                ₹{feeSummary?.paidAmount.toLocaleString() || '95,000'}
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryColLabel}>Outstanding</Text>
              <Text style={[styles.summaryColVal, { color: feeSummary?.pendingAmount ? THEME.colors.danger : THEME.colors.textSecondary }]}>
                ₹{feeSummary?.pendingAmount.toLocaleString() || '0'}
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryColLabel}>Status</Text>
              <Badge label={feeSummary?.status || 'PAID'} variant="success" size="sm" />
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Fee Invoices & Payment Receipts</Text>

        {feeSummary?.invoices.map((inv) => (
          <View key={inv.id} style={styles.invCard}>
            <View style={styles.invHeader}>
              <View>
                <Text style={styles.invNo}>{inv.invoiceNo}</Text>
                <Text style={styles.invHead}>{inv.feeHead}</Text>
              </View>
              <Badge label={inv.status} variant="success" size="sm" />
            </View>

            <View style={styles.invFooter}>
              <View>
                <Text style={styles.invAmount}>₹{inv.amount.toLocaleString()}</Text>
                <Text style={styles.invDate}>Paid on {inv.dueDate}</Text>
              </View>
              <TouchableOpacity
                style={styles.receiptBtn}
                onPress={() => handleDownloadReceipt(inv.invoiceNo)}
              >
                <Download size={14} color={THEME.colors.primary} />
                <Text style={styles.receiptBtnText}>Receipt</Text>
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
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  balanceLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: THEME.typography.weights.black,
    color: THEME.colors.primary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCol: {
    alignItems: 'flex-start',
  },
  summaryColLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  summaryColVal: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  invCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
  },
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invNo: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryLight,
  },
  invHead: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginTop: 2,
  },
  invFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  invAmount: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  invDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.md,
    gap: 4,
  },
  receiptBtnText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
});
