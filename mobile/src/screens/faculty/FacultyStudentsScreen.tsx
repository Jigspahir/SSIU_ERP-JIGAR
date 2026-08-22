import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Search, Filter, User, ChevronRight, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';

interface FacultyStudentItem {
  id: string;
  name: string;
  enrollmentNo: string;
  program: string;
  semester: number;
  division: string;
  attendancePercentage: number;
  cgpa: number;
  status: 'ACTIVE' | 'DETAINED';
}

export const FacultyStudentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<'ALL' | 'DIV_A' | 'DIV_B'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const students: FacultyStudentItem[] = [
    {
      id: 'student-1',
      name: 'Aarav Sharma',
      enrollmentNo: '24010101001',
      program: 'B.Tech Computer Engineering',
      semester: 5,
      division: 'Division A',
      attendancePercentage: 88.9,
      cgpa: 8.62,
      status: 'ACTIVE',
    },
    {
      id: 'student-2',
      name: 'Diya Patel',
      enrollmentNo: '24010101018',
      program: 'B.Tech Computer Engineering',
      semester: 5,
      division: 'Division A',
      attendancePercentage: 74.0,
      cgpa: 7.45,
      status: 'ACTIVE',
    },
    {
      id: 'student-3',
      name: 'Rohan Verma',
      enrollmentNo: '24010101042',
      program: 'B.Tech Computer Engineering',
      semester: 5,
      division: 'Division B',
      attendancePercentage: 68.2,
      cgpa: 6.10,
      status: 'ACTIVE',
    },
    {
      id: 'student-4',
      name: 'Kavya Shah',
      enrollmentNo: '24010101055',
      program: 'B.Tech Computer Engineering',
      semester: 5,
      division: 'Division B',
      attendancePercentage: 92.5,
      cgpa: 9.15,
      status: 'ACTIVE',
    },
  ];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.includes(searchQuery);
    const matchesDiv =
      divisionFilter === 'ALL'
        ? true
        : divisionFilter === 'DIV_A'
        ? s.division.includes('Division A')
        : s.division.includes('Division B');
    return matchesSearch && matchesDiv;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Assigned Students Roster</Text>
        <Text style={styles.topSubtitle}>Department of Computer Engineering • Semester 5</Text>
      </View>

      {/* Search & Division Filter */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={THEME.colors.textMuted} />
          <TextInput
            placeholder="Search by name or enrollment..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.tabRow}>
          {(['ALL', 'DIV_A', 'DIV_B'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, divisionFilter === tab && styles.tabBtnActive]}
              onPress={() => setDivisionFilter(tab)}
            >
              <Text style={[styles.tabBtnText, divisionFilter === tab && styles.tabBtnTextActive]}>
                {tab === 'ALL' ? 'All Classes (120)' : tab === 'DIV_A' ? 'Division A (60)' : 'Division B (60)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        {filteredStudents.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StudentProfile', { studentId: s.id })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{s.name.charAt(0)}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.enrollment}>{s.enrollmentNo} • {s.division}</Text>
                <Text style={styles.program}>{s.program}</Text>
              </View>
              <ChevronRight size={18} color={THEME.colors.textMuted} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Attendance</Text>
                <Text
                  style={[
                    styles.statVal,
                    { color: s.attendancePercentage >= 75 ? THEME.colors.success : THEME.colors.danger },
                  ]}
                >
                  {s.attendancePercentage}%
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>CGPA</Text>
                <Text style={styles.statVal}>{s.cgpa.toFixed(2)}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Status</Text>
                <Badge
                  label={s.attendancePercentage >= 75 ? 'Eligible' : 'Risk (<75%)'}
                  variant={s.attendancePercentage >= 75 ? 'success' : 'danger'}
                  size="sm"
                />
              </View>
            </View>
          </TouchableOpacity>
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
  filterSection: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: THEME.colors.text,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  enrollment: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.semibold,
    marginTop: 1,
  },
  program: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
});
