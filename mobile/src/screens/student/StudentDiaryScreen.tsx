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
import {
  BookOpen,
  ArrowLeft,
  Award,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Clock,
  Download,
  Eye,
  FileText,
  Calendar,
  User,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { DataService } from '../../services/dataService';
import { StudentDiaryEntry } from '../../types';
import { Badge } from '../../components/common/Badge';

export const StudentDiaryScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const studentId = route?.params?.studentId;
  const [diary, setDiary] = useState<StudentDiaryEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'REPORTS' | 'ACHIEVEMENTS' | 'PTM'>('TIMELINE');

  const loadData = async () => {
    const data = await DataService.getStudentDiary(studentId);
    setDiary(data);
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePreviewDoc = (title: string) => {
    navigation.navigate('DocumentViewer', {
      title,
      category: 'ACADEMIC',
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Student Academic Diary & Dossier</Text>
          <Text style={styles.topSubtitle}>Official University Student Life Record</Text>
        </View>
      </View>

      {/* Section Filter Tabs */}
      <View style={styles.tabNav}>
        {(
          [
            { id: 'TIMELINE', label: 'Timeline' },
            { id: 'REPORTS', label: 'Report Cards' },
            { id: 'ACHIEVEMENTS', label: 'Achievements' },
            { id: 'PTM', label: 'PTM Logs' },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.id && styles.tabBtnTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.colors.primary]} />}
      >
        {/* Enrollment & Security Header Banner */}
        <View style={styles.infoBanner}>
          <ShieldCheck size={20} color="#78350F" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoTitle}>Official Digitally Signed Student Record</Text>
            <Text style={styles.infoSubtitle}>
              Continuous authenticated history of academic milestones, verified certificates, and mentor observation remarks.
            </Text>
          </View>
        </View>

        {/* ─── TAB 1: ACADEMIC TIMELINE & SEMESTER RECORDS ──────── */}
        {activeTab === 'TIMELINE' && (
          <View>
            <Text style={styles.sectionHeading}>Semester Progression Records</Text>
            {diary.map((entry, index) => (
              <View key={entry.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDot}>
                    <BookOpen size={12} color="#FFFFFF" />
                  </View>
                  {index < diary.length - 1 && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.timelineCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.semName}>{entry.semester}</Text>
                    <Text style={styles.acadYear}>{entry.academicYear}</Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>SGPA: </Text>
                      <Text style={styles.metricVal}>{entry.sgpa.toFixed(2)}</Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricLabel}>Attendance: </Text>
                      <Text style={styles.metricVal}>{entry.attendancePercentage}%</Text>
                    </View>
                  </View>

                  <Text style={styles.remarksLabel}>Faculty Observation Remarks:</Text>
                  <Text style={styles.remarksText}>"{entry.remarks}"</Text>

                  {entry.achievements.length > 0 && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.subHeading}>Milestones & Achievements:</Text>
                      {entry.achievements.map((ach, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <Award size={13} color="#D97706" />
                          <Text style={styles.bulletText}>{ach}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.entryFooter}>
                    <Clock size={11} color={THEME.colors.textMuted} />
                    <Text style={styles.updatedAtText}>Verified by Mentor: {entry.updatedAt}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── TAB 2: PROGRESS REPORTS & REPORT CARDS ───────────── */}
        {activeTab === 'REPORTS' && (
          <View>
            <Text style={styles.sectionHeading}>Official Grade Sheets & Progress Reports</Text>

            {[
              { title: 'Semester 4 Official Grade Card', sem: 'Semester 4 (Winter 2024)', sgpa: '8.75', status: 'PUBLISHED' },
              { title: 'Semester 3 Official Grade Card', sem: 'Semester 3 (Summer 2024)', sgpa: '8.60', status: 'PUBLISHED' },
              { title: 'Semester 2 Official Grade Card', sem: 'Semester 2 (Winter 2023)', sgpa: '8.40', status: 'PUBLISHED' },
              { title: 'Semester 1 Official Grade Card', sem: 'Semester 1 (Summer 2023)', sgpa: '8.25', status: 'PUBLISHED' },
            ].map((rc, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{rc.title}</Text>
                    <Text style={styles.cardSub}>{rc.sem} • SGPA: <Text style={{ fontWeight: '700', color: THEME.colors.primary }}>{rc.sgpa}</Text></Text>
                  </View>
                  <Badge label="Verified" variant="success" size="sm" />
                </View>

                <View style={styles.cardActionRow}>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => handlePreviewDoc(rc.title)}
                  >
                    <Eye size={14} color={THEME.colors.primary} />
                    <Text style={styles.actionBtnOutlineText}>Preview Report</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => Alert.alert('Download', `Downloading ${rc.title} PDF to device storage...`)}
                  >
                    <Download size={14} color="#FFFFFF" />
                    <Text style={styles.actionBtnPrimaryText}>Download PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── TAB 3: ACHIEVEMENTS & CERTIFICATES ───────────────── */}
        {activeTab === 'ACHIEVEMENTS' && (
          <View>
            <Text style={styles.sectionHeading}>Verified Honors & Certifications</Text>

            {[
              { title: '1st Prize - Swarrnim Startup Ideathon', date: 'Oct 2024', issuer: 'Innovation & Incubation Cell' },
              { title: 'AWS Certified Cloud Practitioner (Foundational)', date: 'Aug 2024', issuer: 'Amazon Web Services' },
              { title: 'NPTEL Elite Certificate - Algorithms', date: 'May 2024', issuer: 'IIT Kharagpur / NPTEL' },
              { title: 'Dean’s Honor List for Academic Excellence', date: 'Jan 2024', issuer: 'Swarrnim Academic Council' },
            ].map((ach, i) => (
              <View key={i} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.certIconBox}>
                    <Award size={22} color="#D97706" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.certTitle}>{ach.title}</Text>
                    <Text style={styles.certIssuer}>{ach.issuer} • {ach.date}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Badge label="Authenticated Credential" variant="success" size="sm" />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ─── TAB 4: PTM CONSULTATION LOGS ─────────────────────── */}
        {activeTab === 'PTM' && (
          <View>
            <Text style={styles.sectionHeading}>Parent–Teacher Consultation History</Text>

            {[
              {
                date: '25 Nov 2024',
                mentor: 'Prof. Ankit Mehta',
                notes: 'Student demonstrates consistent lab performance and high engagement in data structures projects. Advised participation in competitive hackathons.',
                parentAck: 'Acknowledged by Parent: Rajesh Sharma',
              },
              {
                date: '10 May 2024',
                mentor: 'Dr. Priya Patel',
                notes: 'Good progress in theory subjects. Discussed elective subject selections for upcoming semesters.',
                parentAck: 'Acknowledged by Parent: Rajesh Sharma',
              },
            ].map((ptm, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color={THEME.colors.primary} />
                    <Text style={styles.ptmDateText}>{ptm.date}</Text>
                  </View>
                  <Text style={styles.ptmMentorText}>{ptm.mentor}</Text>
                </View>

                <Text style={styles.ptmNotesText}>"{ptm.notes}"</Text>

                <View style={styles.ptmAckBox}>
                  <CheckCircle2 size={13} color={THEME.colors.success} />
                  <Text style={styles.ptmAckText}>{ptm.parentAck}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  topSubtitle: {
    fontSize: 10,
    color: THEME.colors.accentLight,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: '#78350F',
    textTransform: 'uppercase',
  },
  infoSubtitle: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeading: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  semName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  acadYear: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.medium,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricPill: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  metricLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  remarksLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  remarksText: {
    fontSize: 12,
    color: THEME.colors.text,
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  subHeading: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 12,
    color: THEME.colors.text,
    flex: 1,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  updatedAtText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  cardSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  actionBtnPrimaryText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  certIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  certIssuer: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  ptmDateText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  ptmMentorText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  ptmNotesText: {
    fontSize: 12,
    color: THEME.colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
    marginVertical: 6,
  },
  ptmAckBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: THEME.borderRadius.sm,
    gap: 6,
    marginTop: 4,
  },
  ptmAckText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.success,
  },
});
