import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { User, Mail, Phone, Building, ShieldCheck, LogOut, Lock, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, activeRole, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Swarrnim University ERP?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>University Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRoleTag}>{activeRole || user?.role}</Text>

          <View style={{ marginTop: 8 }}>
            <Badge label="Active Account" variant="success" size="sm" />
          </View>
        </View>

        {/* Profile Info Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Official University Credentials</Text>

          <View style={styles.infoRow}>
            <Mail size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Official Email</Text>
              <Text style={styles.infoVal}>{user?.email}</Text>
            </View>
          </View>

          {user?.enrollmentNo && (
            <View style={styles.infoRow}>
              <ShieldCheck size={16} color={THEME.colors.primary} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Enrollment Number</Text>
                <Text style={styles.infoVal}>{user.enrollmentNo}</Text>
              </View>
            </View>
          )}

          {user?.employeeId && (
            <View style={styles.infoRow}>
              <ShieldCheck size={16} color={THEME.colors.primary} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Employee ID</Text>
                <Text style={styles.infoVal}>{user.employeeId}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Building size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Institute & Department</Text>
              <Text style={styles.infoVal}>{user?.instituteName || 'Swarrnim Institute of Technology'}</Text>
              <Text style={styles.infoSubVal}>{user?.departmentName || 'Computer Engineering'}</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out of Account"
          variant="outline"
          onPress={handleLogout}
          icon={<LogOut size={16} color={THEME.colors.primary} />}
          style={{ marginTop: 10 }}
        />
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
  profileHeaderCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  userRoleTag: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primaryLight,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  cardHeader: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoTextGroup: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.text,
    marginTop: 2,
  },
  infoSubVal: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
});
