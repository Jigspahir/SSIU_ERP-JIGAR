import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';

export const StudentProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Student Academic Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Identity Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Aarav Sharma'}</Text>
          <Text style={styles.enrollmentTag}>Enrollment: {user?.enrollmentNo || '24010101001'}</Text>

          <View style={styles.badgeRow}>
            <Badge label="Regular • Good Standing" variant="success" size="sm" />
            <Badge label="ABC ID: ABC-984210" variant="info" size="sm" />
          </View>
        </View>

        {/* Academic Program Credentials */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Program & Institute</Text>

          <View style={styles.infoRow}>
            <GraduationCap size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Degree Program</Text>
              <Text style={styles.infoVal}>{user?.programName || 'Bachelor of Technology (B.Tech)'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <BookOpen size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoVal}>{user?.departmentName || 'Computer Engineering'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Building size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Institute</Text>
              <Text style={styles.infoVal}>{user?.instituteName || 'Swarrnim Institute of Technology'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Current Semester & Batch</Text>
              <Text style={styles.infoVal}>Semester 5 • Batch 2022–2026 • Division A</Text>
            </View>
          </View>
        </View>

        {/* Mentor & Guidance */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Assigned Faculty Mentor</Text>

          <View style={styles.infoRow}>
            <User size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Mentor Name</Text>
              <Text style={styles.infoVal}>Prof. Ankit Mehta</Text>
              <Text style={styles.infoSubVal}>Assistant Professor, Dept of Computer Engineering</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={16} color={THEME.colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Mentor Contact Email</Text>
              <Text style={styles.infoVal}>ankit.mehta@swarrnim.edu.in</Text>
            </View>
          </View>
        </View>

        {/* Official Identity & Security */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>University Security & Verification</Text>

          <View style={styles.infoRow}>
            <ShieldCheck size={16} color={THEME.colors.success} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Academic Bank of Credits (ABC)</Text>
              <Text style={styles.infoVal}>Verified & Linked via DigiLocker (ID: 984-210-482)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Award size={16} color={THEME.colors.accentDark} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Cumulative Credits Earned</Text>
              <Text style={styles.infoVal}>108 Credits across 4 Semesters</Text>
            </View>
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: THEME.colors.accent,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  enrollmentTag: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primaryLight,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
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
    fontSize: THEME.typography.sizes.xs,
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
