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
  FileText,
  ArrowLeft,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Share2,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';

export const StudentDocumentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const documents = [
    {
      id: 'doc-1',
      title: 'University Student ID Card',
      category: 'IDENTITY',
      fileSize: '420 KB',
      status: 'VERIFIED',
      uploadDate: '10 Aug 2024',
      isLocked: true,
    },
    {
      id: 'doc-2',
      title: 'Aadhaar Card Copy',
      category: 'IDENTITY',
      fileSize: '1.2 MB',
      status: 'VERIFIED',
      uploadDate: '10 Aug 2024',
      isLocked: true,
    },
    {
      id: 'doc-3',
      title: '12th HSC Official Marksheet',
      category: 'ACADEMIC',
      fileSize: '2.4 MB',
      status: 'VERIFIED',
      uploadDate: '12 Aug 2024',
      isLocked: true,
    },
    {
      id: 'doc-4',
      title: '10th SSC Official Marksheet',
      category: 'ACADEMIC',
      fileSize: '1.8 MB',
      status: 'VERIFIED',
      uploadDate: '12 Aug 2024',
      isLocked: true,
    },
    {
      id: 'doc-5',
      title: 'Semester 4 Official Grade Card',
      category: 'ACADEMIC',
      fileSize: '650 KB',
      status: 'VERIFIED',
      uploadDate: '25 Jun 2024',
      isLocked: false,
    },
    {
      id: 'doc-6',
      title: 'Official Bonafide Certificate',
      category: 'CERTIFICATE',
      fileSize: '310 KB',
      status: 'VERIFIED',
      uploadDate: '14 Feb 2025',
      isLocked: false,
    },
  ];

  const handleDownload = (title: string) => {
    Alert.alert('Document Download', `Downloading "${title}" securely to your device...`);
  };

  const handlePreview = (doc: any) => {
    navigation.navigate('DocumentViewer', {
      title: doc.title,
      category: doc.category,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Student Document Vault</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.vaultBadge}>
          <ShieldCheck size={20} color="#065F46" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.vaultTitle}>Verified & Tamper-Proof Records</Text>
            <Text style={styles.vaultDesc}>
              Documents verified and signed by the Swarrnim University Registrar & Student Section.
            </Text>
          </View>
        </View>

        {documents.map((doc) => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docIconBox}>
              <FileText size={22} color={THEME.colors.primary} />
            </View>

            <View style={styles.docInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                {doc.isLocked && <Lock size={12} color={THEME.colors.textMuted} />}
              </View>
              <Text style={styles.docMeta}>
                {doc.category} • {doc.fileSize} • Uploaded {doc.uploadDate}
              </Text>
              <View style={{ marginTop: 6 }}>
                <Badge label="Verified by Admin" variant="success" size="sm" />
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.iconActionBtn}
                onPress={() => handlePreview(doc)}
              >
                <Eye size={18} color={THEME.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconActionBtn, { backgroundColor: '#F0FDF4' }]}
                onPress={() => handleDownload(doc.title)}
              >
                <Download size={18} color="#059669" />
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
  vaultBadge: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  vaultTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: '#065F46',
    textTransform: 'uppercase',
  },
  vaultDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
    ...THEME.shadows.sm,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  docMeta: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 6,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
