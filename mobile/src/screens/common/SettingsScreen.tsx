import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {
  Bell,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  Info,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { CONFIG } from '../../constants/config';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { logout } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [examReminders, setExamReminders] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Settings & Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Push Notification Preferences */}
        <Text style={styles.sectionHeader}>Notification Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Text style={styles.rowTitle}>Mobile Push Notifications</Text>
              <Text style={styles.rowSub}>Receive instant alerts on your device</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#CBD5E1', true: THEME.colors.primaryLight }}
              thumbColor={pushEnabled ? THEME.colors.accent : '#F1F5F9'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLabelGroup}>
              <Text style={styles.rowTitle}>Exam & PTM Reminders</Text>
              <Text style={styles.rowSub}>Automated reminders for schedules</Text>
            </View>
            <Switch
              value={examReminders}
              onValueChange={setExamReminders}
              trackColor={{ false: '#CBD5E1', true: THEME.colors.primaryLight }}
              thumbColor={examReminders ? THEME.colors.accent : '#F1F5F9'}
            />
          </View>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate('NotificationPreferences')}
          >
            <Bell size={18} color={THEME.colors.primary} />
            <Text style={styles.navRowTitle}>Customize 12 Notification Categories</Text>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>


        {/* General & Support */}
        <Text style={styles.sectionHeader}>University Support & Policies</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => Linking.openURL(`mailto:${CONFIG.SUPPORT_EMAIL}`)}
          >
            <HelpCircle size={18} color={THEME.colors.primary} />
            <Text style={styles.navRowTitle}>Helpdesk & Technical Support</Text>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => Linking.openURL(CONFIG.PORTAL_URL)}
          >
            <Globe size={18} color={THEME.colors.primary} />
            <Text style={styles.navRowTitle}>Open Web ERP Portal</Text>
            <ExternalLink size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => Alert.alert('Privacy Policy', 'Swarrnim University ERP complies with national educational data privacy standards and 256-bit AES encryption.')}
          >
            <Shield size={18} color={THEME.colors.primary} />
            <Text style={styles.navRowTitle}>Privacy Policy & Security</Text>
            <ChevronRight size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* App Version Card */}
        <View style={styles.versionBox}>
          <Text style={styles.appNameText}>{CONFIG.APP_NAME}</Text>
          <Text style={styles.versionSub}>{CONFIG.VERSION} • Production Release</Text>
          <Text style={styles.copyright}>© 2026 {CONFIG.UNIVERSITY_FULL_NAME}. All rights reserved.</Text>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={THEME.colors.danger} />
          <Text style={styles.logoutBtnText}>Log Out from Mobile ERP</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabelGroup: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.text,
  },
  rowSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  navRowTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.text,
    flex: 1,
    marginLeft: 12,
  },
  versionBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appNameText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  versionSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  copyright: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.dangerLight,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
    marginTop: 8,
  },
  logoutBtnText: {
    color: THEME.colors.danger,
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
  },
});
