import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';

export const DocumentViewerScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { title = 'Official Document', category = 'ACADEMIC' } = route?.params || {};

  const handleDownload = () => {
    Alert.alert('Download', `Downloading ${title} to device storage...`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Document Simulated Viewer Canvas */}
        <View style={styles.documentCanvas}>
          <View style={styles.docHeader}>
            <Text style={styles.universityName}>SWARRNIM STARTUP & INNOVATION UNIVERSITY</Text>
            <Text style={styles.instName}>Office of Academic Affairs & Examination Cell</Text>
            <Text style={styles.docTypeTitle}>{title.toUpperCase()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.docBody}>
            <Text style={styles.bodyText}>
              This is to officially certify that the student associated with enrollment number <Text style={{ fontWeight: '700' }}>24010101001</Text> is a bonafide student of Swarrnim University pursuing the B.Tech Degree Program.
            </Text>

            <View style={styles.securitySealBox}>
              <ShieldCheck size={40} color={THEME.colors.primary} />
              <Text style={styles.sealText}>DIGITALLY SIGNED & VERIFIED BY SSIU REGISTRAR</Text>
              <Text style={styles.sealDate}>Issued: February 2025 • Tamper-Evident ID: SSIU-DOC-98421</Text>
            </View>
          </View>
        </View>

        <Button
          title="Download PDF Copy"
          onPress={handleDownload}
          icon={<Download size={16} color="#FFFFFF" />}
          style={{ marginTop: 20 }}
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
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  documentCanvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minHeight: 400,
    ...THEME.shadows.md,
  },
  docHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  universityName: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.black,
    color: THEME.colors.primary,
    textAlign: 'center',
  },
  instName: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  docTypeTitle: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.accentDark,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1.5,
    backgroundColor: THEME.colors.primary,
    marginVertical: 12,
  },
  docBody: {
    paddingVertical: 10,
  },
  bodyText: {
    fontSize: 13,
    color: THEME.colors.text,
    lineHeight: 22,
  },
  securitySealBox: {
    alignItems: 'center',
    marginTop: 40,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: THEME.colors.border,
  },
  sealText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
    marginTop: 6,
  },
  sealDate: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
});
